/* eslint-disable no-console,@typescript-eslint/no-var-requires */

const { spawnSync } = require('child_process');
const chalk = require('chalk');

const IDE_PROCESS_NAMES = [
  'rider64',
  'idea64',
  'webstorm64',
  'phpstorm64',
  'pycharm64',
  'clion64',
  'goland64',
  'datagrip64',
  'rubymine64',
  'Cursor',
  'Code'
];

const JETBRAINS_HINTS = [
  ['rider', 'rider64'],
  ['webstorm', 'webstorm64'],
  ['phpstorm', 'phpstorm64'],
  ['pycharm', 'pycharm64'],
  ['clion', 'clion64'],
  ['goland', 'goland64'],
  ['datagrip', 'datagrip64'],
  ['rubymine', 'rubymine64'],
  ['intellij', 'idea64'],
  ['idea', 'idea64']
];

function formatTime(date) {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  return result.status ?? 1;
}

function escapePsSingleQuoted(value) {
  return String(value).replace(/'/g, "''");
}

function envBlob() {
  const env = process.env;
  return [
    env.__INTELLIJ_COMMAND_HISTFILE__,
    env.IDEA_INITIAL_DIRECTORY,
    env.JB_IDE,
    env.JETBRAINS_IDE,
    env.VSCODE_IPC_HOOK,
    env.VSCODE_IPC_HOOK_CLI,
    env.VSCODE_GIT_IPC_HANDLE,
    env.VSCODE_GIT_ASKPASS_MAIN,
    env.VSCODE_NLS_CONFIG,
    env.CURSOR_TRACE_ID,
    env.TERM_PROGRAM,
    env.TERMINAL_EMULATOR,
    env.__CFBundleIdentifier
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
}

function detectJetBrainsProcessName(blob) {
  for (const [hint, processName] of JETBRAINS_HINTS) {
    if (blob.includes(hint)) return processName;
  }
  return null;
}

/**
 * Infer which IDE launched this build from terminal env vars (and parent PIDs on Windows).
 * Returns a Windows process name like 'rider64' or 'Cursor', or null if unknown.
 */
function detectPreferredIdeProcessName() {
  const env = process.env;
  const blob = envBlob();

  // Cursor (VS Code fork) — check before generic vscode.
  if (
    env.CURSOR_TRACE_ID ||
    blob.includes('cursor') ||
    /cursor/i.test(env.__CFBundleIdentifier || '')
  ) {
    return 'Cursor';
  }

  // VS Code family
  if (
    env.TERM_PROGRAM === 'vscode' ||
    env.VSCODE_INJECTION ||
    env.VSCODE_PID ||
    env.VSCODE_IPC_HOOK ||
    env.VSCODE_GIT_ASKPASS_MAIN
  ) {
    return 'Code';
  }

  // JetBrains integrated terminal
  if (
    env.TERMINAL_EMULATOR === 'JetBrains-JediTerm' ||
    /jetbrains/i.test(env.TERMINAL_EMULATOR || '') ||
    env.__INTELLIJ_COMMAND_HISTFILE__
  ) {
    return detectJetBrainsProcessName(blob) || detectIdeFromWindowsParentProcesses();
  }

  // Native Windows: walk parent process chain (no help inside WSL alone).
  return detectIdeFromWindowsParentProcesses();
}

/**
 * Walk Windows parent processes looking for a known IDE.
 * Useful when npm runs outside WSL, or as JetBrains product fallback.
 */
function detectIdeFromWindowsParentProcesses() {
  const namesList = IDE_PROCESS_NAMES.map(n => `'${n}'`).join(',');
  const psScript = `
$ErrorActionPreference = 'SilentlyContinue'
$ideNames = @(${namesList})
$proc = Get-CimInstance Win32_Process -Filter "ProcessId=$PID"
while ($proc) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($proc.Name)
  if ($ideNames -contains $base) {
    Write-Output $base
    exit 0
  }
  if (-not $proc.ParentProcessId -or $proc.ParentProcessId -eq 0) { break }
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.ParentProcessId)"
}
`.trim();

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
  );

  const name = (result.stdout || '').trim();
  return IDE_PROCESS_NAMES.includes(name) ? name : null;
}

function buildIdePriorityList(preferred) {
  if (!preferred) return [...IDE_PROCESS_NAMES];
  return [preferred, ...IDE_PROCESS_NAMES.filter(name => name !== preferred)];
}

/**
 * Flash the IDE taskbar icon and show a Windows toast notification.
 * Uses powershell.exe (works from WSL and native Windows).
 */
function notifyBuildFinished({ success, duration }) {
  const title = success ? 'Build finished' : 'Build failed';
  const body = `anima-beyond-foundry · ${duration}`;
  const titlePs = escapePsSingleQuoted(title);
  const bodyPs = escapePsSingleQuoted(body);

  const preferredIde = detectPreferredIdeProcessName();
  const ideNames = buildIdePriorityList(preferredIde);
  const ideNamesPs = ideNames.map(name => `'${escapePsSingleQuoted(name)}'`).join(',');

  if (preferredIde) {
    console.log(chalk.gray(`↗ Notifying ${preferredIde}`));
  }

  // Encoded as base64 UTF-16LE so quoting/path issues never break the call from WSL.
  const psScript = `
$ErrorActionPreference = 'SilentlyContinue'

# --- Taskbar flash (detected IDE first, then fallbacks) ---
$names = @(${ideNamesPs})
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class TaskbarFlash {
  [StructLayout(LayoutKind.Sequential)]
  public struct FLASHWINFO {
    public uint cbSize;
    public IntPtr hwnd;
    public uint dwFlags;
    public uint uCount;
    public uint dwTimeout;
  }
  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  public static extern bool FlashWindowEx(ref FLASHWINFO pwfi);
  public static bool Flash(IntPtr hwnd) {
    FLASHWINFO info = new FLASHWINFO();
    info.cbSize = (uint)Marshal.SizeOf(info);
    info.hwnd = hwnd;
    info.dwFlags = 3 | 12; // FLASHW_ALL | FLASHW_TIMERNOFG
    info.uCount = uint.MaxValue;
    info.dwTimeout = 0;
    return FlashWindowEx(ref info);
  }
}
"@
foreach ($name in $names) {
  $proc = Get-Process -Name $name -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } |
    Select-Object -First 1
  if ($proc) {
    [void][TaskbarFlash]::Flash($proc.MainWindowHandle)
    break
  }
}

# --- Windows toast (same style as system / Cursor permission prompts) ---
$title = '${titlePs}'
$body = '${bodyPs}'
try {
  $ErrorActionPreference = 'Stop'
  $null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
  $null = [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]

  $escapedTitle = [System.Security.SecurityElement]::Escape($title)
  $escapedBody = [System.Security.SecurityElement]::Escape($body)
  $xmlString = @"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>$escapedTitle</text>
      <text>$escapedBody</text>
    </binding>
  </visual>
</toast>
"@

  $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
  $xml.LoadXml($xmlString)
  $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
  $toast.ExpirationTime = [DateTimeOffset]::Now.AddMinutes(2)

  # Registered AUMID for Windows PowerShell so the toast is allowed to show.
  $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
} catch {
  # Fallback: balloon tip (Windows 10+ usually redirects it to a toast).
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $notify = New-Object System.Windows.Forms.NotifyIcon
  $notify.Icon = [System.Drawing.SystemIcons]::Information
  $notify.Visible = $true
  $notify.BalloonTipTitle = $title
  $notify.BalloonTipText = $body
  $notify.ShowBalloonTip(5000)
  Start-Sleep -Milliseconds 5500
  $notify.Dispose()
}
`.trim();

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], {
    stdio: ['ignore', 'ignore', 'ignore']
  });
}

const startedAt = new Date();
console.log(chalk.cyan(`\n▶ Build started at ${formatTime(startedAt)}`));

let exitCode = run('npm', ['run', 'build:prod']);
if (exitCode === 0) {
  exitCode = run('node', ['scripts/copyDirectoryToFoundrySystem.cjs', 'animabf']);
}

const finishedAt = new Date();
const duration = formatDuration(finishedAt - startedAt);
const success = exitCode === 0;

if (success) {
  console.log(
    chalk.green(
      `✔ Build finished at ${formatTime(finishedAt)} (started ${formatTime(startedAt)}, took ${duration})`
    )
  );
} else {
  console.log(
    chalk.red(
      `✖ Build failed at ${formatTime(finishedAt)} (started ${formatTime(startedAt)}, took ${duration})`
    )
  );
}

notifyBuildFinished({ success, duration });
process.exit(exitCode);

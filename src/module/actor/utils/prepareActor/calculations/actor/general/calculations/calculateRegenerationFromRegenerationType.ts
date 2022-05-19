export const calculateRegenerationFromRegenerationType = (regenerationType: number): [resting:string, normal: string, recovery: string, esp: string] => {
  switch (regenerationType) {
    case 0:
      return ["0", "0", "NA", ""];
    case 1:
      return ["10 al día", "5 al día", "-5 al día", ""];
    case 2:
      return ["20 al día", "10 al día", "-5 al día", ""];
    case 3:
      return ["30 al día", "15 al día", "-5 al día", ""];
    case 4:
      return ["40 al día", "20 al día", "-10 al día", ""];
    case 5:
      return ["50 al día", "25 al día", "-10 al día", "No quedan cicatrices"];
    case 6:
      return ["75 al día", "30 al día", "-15 al día", "El personaje no sufre los efectos del desangramiento"];
    case 7:
      return ["100 al día", "50 al día", "-20 al día", "Los miembros limpiamente amputados se recuperan si se unen al muñón durante una semana"];
    case 8:
      return ["250 al día", "100 al día", "-25 al día", "Como el anterior, pero en cinco días"];
    case 9:
      return ["500 al día", "200 al día", "-30 al día", "Como el anterior, pero en tres días. El personaje supera automáticamente el estado entre la vida y la muerte"];
    case 10:
      return ["1 por minuto", "", "-40 al día", "Como el anterior, pero en un día"];
    case 11:
      return ["2 por minuto", "", "-50 al día", "Cualquier miembro amputado se recupera, uniendo los restos al muñón durante una semana"];
    case 12:
      return ["5 por minuto", "", "-5 por hora", "Como el anterior, pero en tres días"];
    case 13:
      return ["10 por minuto", "", "-10 por hora", "Como el anterior, pero en un día"];
    case 14:
      return ["1 por asalto", "", "-15 por hora", "Cualquier miembro se recupera, uniéndolo al muñón durante unas pocas horas"];
    case 15:
      return ["5 por asalto", "", "-20 por hora", "Cualquier miembro se recupera inmediatamente si se une al muñón durante un asalto. Salvo la cabeza, cualquier miembro amputado vuelve a crecer en una semana"];
    case 16:
      return ["10 por asalto", "", "-10 por minuto", "Salvo la cabeza, cualquier miembro amputado vuelve a crecer en un día"];
    case 17:
      return ["25 por asalto", "", "-10 por asalto", "Salvo la cabeza, cualquier miembro amputado vuelve a crecer en pocos minutos"];
    case 18:
      return ["50 por asalto", "", "-25 por asalto", "Salvo la cabeza, cualquier miembro amputado vuelve a crecer en pocos asaltos"];
    case 19:
      return ["100 por asalto", "", "Todos", "Cualquier miembro seccionado crece y es completamente funcional en un asalto"];
    default:
      return ["250 por asalto", "", "Todos", "Todos los críticos físicos son anulados"];
  }
};

import ABFItem from './ABFItem';
import { ABFItems } from './ABFItems';
//Provide a type string to class object mapping to keep our code clean
const itemMappings = {
  [ABFItems.SECONDARY_SPECIAL_SKILL]: ABFItem,
  [ABFItems.SPELL]: ABFItem,
  [ABFItems.SPELL_MAINTENANCE]: ABFItem,
  [ABFItems.SELECTED_SPELL]: ABFItem,
  [ABFItems.ACT_VIA]: ABFItem,
  [ABFItems.INNATE_MAGIC_VIA]: ABFItem,
  [ABFItems.PREPARED_SPELL]: ABFItem,
  [ABFItems.METAMAGIC]: ABFItem,
  [ABFItems.SUMMON]: ABFItem,
  [ABFItems.LEVEL]: ABFItem,
  [ABFItems.LANGUAGE]: ABFItem,
  [ABFItems.ELAN]: ABFItem,
  [ABFItems.ELAN_POWER]: ABFItem,
  [ABFItems.TITLE]: ABFItem,
  [ABFItems.ADVANTAGE]: ABFItem,
  [ABFItems.DISADVANTAGE]: ABFItem,
  [ABFItems.CONTACT]: ABFItem,
  [ABFItems.NOTE]: ABFItem,
  [ABFItems.PSYCHIC_DISCIPLINE]: ABFItem,
  [ABFItems.MENTAL_PATTERN]: ABFItem,
  [ABFItems.INNATE_PSYCHIC_POWER]: ABFItem,
  [ABFItems.PSYCHIC_POWER]: ABFItem,
  [ABFItems.KI_SKILL]: ABFItem,
  [ABFItems.NEMESIS_SKILL]: ABFItem,
  [ABFItems.ARS_MAGNUS]: ABFItem,
  [ABFItems.MARTIAL_ART]: ABFItem,
  [ABFItems.CREATURE]: ABFItem,
  [ABFItems.SPECIAL_SKILL]: ABFItem,
  [ABFItems.TECHNIQUE]: ABFItem,
  [ABFItems.COMBAT_SPECIAL_SKILL]: ABFItem,
  [ABFItems.COMBAT_TABLE]: ABFItem,
  [ABFItems.AMMO]: ABFItem,
  [ABFItems.WEAPON]: ABFItem,
  [ABFItems.ARMOR]: ABFItem,
  [ABFItems.SUPERNATURAL_SHIELD]: ABFItem,
  [ABFItems.INVENTORY_ITEM]: ABFItem
};

export const ABFItemProxy = new Proxy(function () {}, {
  //Will intercept calls to the "new" operator
  construct: function (target, args) {
    const [data] = args;

    //Handle missing mapping entries
    if (!itemMappings.hasOwnProperty(data.type))
      throw new Error('Unsupported Entity type for create(): ' + data.type);

    //Return the appropriate, actual object from the right class
    return new itemMappings[data.type](...args);
  },

  //Property access on this weird, dirty proxy object
  get: function (target, prop, receiver) {
    switch (prop) {
      case 'create':
      case 'createDocuments':
        //Calling the class' create() static function
        return function (data, options) {
          if (data.constructor === Array) {
            //Array of data, this happens when creating Items imported from a compendium
            return data.map(i => ABFItemProxy.create(i, options));
          }

          if (!itemMappings.hasOwnProperty(data.type))
            throw new Error('Unsupported Entity type for create(): ' + data.type);

          return itemMappings[data.type].create(data, options);
        };

      case Symbol.hasInstance:
        //Applying the "instanceof" operator on the instance object
        return function (instance) {
          return Object.values(itemMappings).some(i => instance instanceof i);
        };

      default:
        //Just forward any requested properties to the base Item class
        return Item[prop];
    }
  }
});

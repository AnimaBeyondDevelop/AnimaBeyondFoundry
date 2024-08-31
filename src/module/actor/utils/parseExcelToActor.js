import { ABFActor } from "../ABFActor";

  /**
   * Parses excel data to actor data
   *
   * @param {any} excelData - provided exel data
   * @param {ABFActor} actor - provided Actor to update
   */
  export const parseExcelToActor = (excelData, actor) => {
    console.log(actor);
    actor.update({
        name: excelData.name,
        system: {
            characteristics: {
                secondaries: { 
                    lifePoints: { 
                        value: excelData.health_current,  
                        max: excelData.health_max
                    } 
                }
            }
        }
    });
  }



export class abfActor extends Actor {

    prepareData() {
        super.prepareData();

        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;

        if (actorData.type === 'character') this._prepareCharacterData(actorData);
        }

        _prepareCharacterData(actorData:any):void {
            const data = actorData.data;
            
            for (const char of Object.values(data.characteristics.primaries as Record<any, any>)) {
                if (char.value < 4){
                    char.mod =(char.value*10)-40
                }
                if (char.value >= 4){
                    char.mod = ((Math.floor ((char.value+5)/5) + Math.floor((char.value+4)/5) +Math.floor((char.value+2)/5))-4)*5
                }
            } 
        }
}
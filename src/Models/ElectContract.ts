export class ElectContract {
    
    constructor(
        public power: number,
        public days: number,
        public consumed: number,
        public powerPrice: number,
        public consumedPrice: number
    ) {  }
}
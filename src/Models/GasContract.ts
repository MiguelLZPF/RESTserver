export class GasContract {

    constructor(
        public days: number,
        public consumed: number,
        public fixedPrice: number,
        public consumedPrice: number
    ) {  }
}
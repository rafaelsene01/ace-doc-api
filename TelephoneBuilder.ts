export class TelephoneBuilder {
  private _telephone: any;

  constructor() {
    this._telephone = {};
  }

  public withTelNumber(number: string): TelephoneBuilder {
    this._telephone.number = number;
    return this;
  }

  public withDdd(ddd: string): TelephoneBuilder {
    this._telephone.ddd = ddd;
    return this;
  }

  public withFax(fax: string): TelephoneBuilder {
    this._telephone.fax = fax;
    return this;
  }

  public build() {
    return this._telephone;
  }
}

// chamando
// const telephone = new TelephoneBuilder()
//     .withDdd('34')
//     .withTelNumber('2423423')
//     .build()

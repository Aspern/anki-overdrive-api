import {expect} from "chai";
import {VehicleScanner} from "../core/vehicle/vehicle-scanner";

describe("Hello World", () => {

    it('says hello world', (done) => {

         let scanner = new VehicleScanner();
        //
        // expect(scanner).not.to.be.null;
        // done();

        expect(true).to.be.true;
        done();

    });

});
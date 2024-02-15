const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app"); 

chai.use(chaiHttp);
const expect = chai.expect;

describe("Healthz Endpoint", () => {
  it("should return a 200 OK response if the database is connected", (done) => {
    chai
      .request({})
      .get("/healthz")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
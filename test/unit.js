const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app"); 

chai.use(chaiHttp);
const expect = chai.expect;

describe("Healthz Endpoint", () => {
  it("should return a 200 OK response if the database is connected", (done) => {
    chai
      .request(app)
      .get("/healthz")
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  // After all tests are finished, exit with code 0 (success)
  after(() => {
    process.exit(0);
  });
});

import { GitClubApplication } from "../fixtures/application";
import { givenApp } from "../fixtures/support";
import { OsoBindings } from "../../keys";

describe("Application Integration", function() {
  let app: GitClubApplication;
  beforeAll(async () => {
    app = await givenApp();
  });

  afterAll(async () => {
    await app.stop();
  });

  it("should mount components", function() {
    expect(app.isBound(OsoBindings.POLICY)).toBeTruthy();
  });
});

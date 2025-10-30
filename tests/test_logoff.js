it("should log the user on", async () => {
    const dataToPost = {
      _csrf: this.csrfToken,
    };
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .post("/session/logoff")
      .set("Cookie", this.csrfToken + ";" + this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    const res = await req;
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/");
    const cookies = res.headers["set-cookie"];
    sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid"),
    );
    expect(this.sessionCookie).to.not.be.undefined;
  });
let chai_obj = null;

const get_chai = async () => {
  if (!chai_obj) {
    const { use, expect } = await import("chai");
    const chaiHttp = await import("chai-http");
    const chai = await use(chaiHttp.default);
    chai_obj = { expect: expect, request: chai.request };
  }
  return chai_obj;
};

module.exports = get_chai;
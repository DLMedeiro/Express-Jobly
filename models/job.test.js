"use strict";

const { fail } = require("assert");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: "0.5",
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1"
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
      },
      {
        title: "j2",
        salary: 500000,
        equity: "0.5",
        companyHandle: "c2"
      }
    ]);
  });
  /************************************** findAll - WITH FILTER */
  test("works: partial title filter only", async function () {
    let jobs = await Job.findAll({title:"1"});
    expect(jobs).toEqual([
    {
        title: "j1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
        }
    ]);
  });
  test("works: minSalary filter only", async function () {
    let jobs = await Job.findAll({minSalary:400000});
    expect(jobs).toEqual([
    {
        title: "j2",
        salary: 500000,
        equity: "0.5",
        companyHandle: "c2"
    }
    ]);
  });
  test("works: hasEquity filter only", async function () {
    let jobs = await Job.findAll({hasEquity:true});
    expect(jobs).toEqual( [
        {
            title: "j2",
            salary: 500000,
            equity: "0.5",
            companyHandle: "c2"
        }
    ]);
  });
  test("works: multiple filters", async function () {
    let jobs = await Job.findAll({title:"j", minSalary:100000});
    expect(jobs).toEqual( [
        {
            title: "j1",
            salary: 100000,
            equity: "0",
            companyHandle: "c1"
          },
          {
            title: "j2",
            salary: 500000,
            equity: "0.5",
            companyHandle: "c2"
          }
    ]);
  });  
});




/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("j1");
    expect(job).toEqual({
        title: "j1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
      });
  });

  test("not found if no such company", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "j1",
    salary: 50,
    equity: "0",
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.update("j1", updateData);
    expect(job).toEqual({
      title: "j1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'j1'`);
    expect(result.rows).toEqual([{
        title: "j1",
        salary: 50,
        equity: "0",
        companyHandle: "c1"
      }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("j1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("j1");
    const res = await db.query(
        "SELECT title FROM jobs WHERE title='j1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

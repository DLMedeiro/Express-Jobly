"use strict";

const db = require("../db");
const { NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate} = require("../helpers/sql");


/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create(data) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [data.title]);


    if (duplicateCheck.rows[0]){
      throw new ExpressError(`Duplicate job: ${data.title}`,400);
    }

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          data.title,
          data.salary,
          data.equity,
          data.companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all job.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(searchFilters = {}) {
    const { title, minSalary, hasEquity, companyHandle} = searchFilters;

    // console.log(`searchFilters = ${searchFilters}, title = ${title}, minSalary = ${minSalary}, hasEquity = ${hasEquity}, companyHandle = ${companyHandle}`);

    // Query text "Where" statement
    let whereProps = [];

    // Values to be added in to where statement $ placeholders
    let queryVals = [];

    let sqlQuery = 
      `SELECT title,
        salary,
        equity,
        company_handle AS "companyHandle"
      FROM jobs`;
    
    if (title !== undefined) {
    queryVals.push(`%${title}%`);
    whereProps.push(`title ILIKE $${queryVals.length}`);
    };
    
    if (minSalary !== undefined) {
      queryVals.push(minSalary);
      whereProps.push(`salary >= $${queryVals.length}`);
    };

    if(hasEquity !== undefined) {
        whereProps.push(`equity > 0`)
    }

    // added to support FindAll companies response
    if(companyHandle !== undefined) {
      queryVals.push(companyHandle);
      whereProps.push(`company_handle = $${queryVals.length}`);
    }

    if(whereProps.length > 0) {
      sqlQuery += " WHERE " + whereProps.join(" AND ");
    };

    sqlQuery += " ORDER BY title"

    let jobsRes = await db.query(sqlQuery, queryVals);

    // console.log(`return = ${jobsRes.rows}`);
    // console.log(`queryVals = ${queryVals}`);
    // console.log(`whereProps = ${whereProps}`);

    return jobsRes.rows;
  }

  /** Given a job handle, return data about job.
   *
   * Returns { title, salary, equity, companyHandle }

   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE title = $1`,
        [title]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with title: ${title}`);
    // console.log(`equity type = ${typeof(job.equity)}`);
    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} 
                      RETURNING title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with title: ${title}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
        [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with title: ${title}`);
  }
}


module.exports = Job;

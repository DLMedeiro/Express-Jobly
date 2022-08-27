"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate} = require("../helpers/sql");
const Job = require("./job");


/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create(data) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [data.handle]);

    if (duplicateCheck.rows[0])
      // throw new BadRequestError(`Duplicate company: ${handle}`);
      throw new ExpressError(`Duplicate job: ${data.title}`,400);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          data.handle,
          data.name,
          data.description,
          data.numEmployees,
          data.logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(searchFilters = {}) {
    const { minEmployees, maxEmployees, name } = searchFilters;

    // console.log(`searchFilters = ${searchFilters}, minEmp = ${minEmployees}, maxEmp = ${maxEmployees}, name = ${name}`);

    // Query text "Where" statement
    let whereProps = [];

    // Values to be added in to where statement $ placeholders
    let queryVals = [];

    let sqlQuery = 
      `SELECT handle,
        name,
        description,
        num_employees AS "numEmployees",
        logo_url AS "logoUrl"
      FROM companies`;

    if (minEmployees > maxEmployees) {
      throw new BadRequestError("min value can not be larger than max");
    };
    
    if (minEmployees !== undefined) {
      queryVals.push(minEmployees);
      whereProps.push(`num_employees >= $${queryVals.length}`);
    };
    if (maxEmployees !== undefined) {
      queryVals.push(maxEmployees);
      whereProps.push(`num_employees <= $${queryVals.length}`);
    };
    if (name) {
      queryVals.push(`%${name}%`);
      whereProps.push(`name ILIKE $${queryVals.length}`);
    };

    if(whereProps.length > 0) {
      sqlQuery += " WHERE " + whereProps.join(" AND ");
    };
      // Add WHERE query information for each search criteria provided.  "whereProps" = the where property, queryVals.length provides the "$x" value needed to place the variable
      // Allows for a simpler SELECT statement, if criteria is not provided it is not included in the statement

    sqlQuery += " ORDER BY name"

    let companiesRes = await db.query(sqlQuery, queryVals);

    // console.log(`return = ${companiesRes.rows}`);
    // console.log(`queryVals = ${queryVals}`);
    // console.log(`whereProps = ${whereProps}`);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {

    // Some companies will not have jobs attached, get function needs to pull company regardless of if a job is attached
    
    const initialSearch = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
        FROM companies 
        WHERE handle = $1`, 
        [handle]);

    const i = initialSearch.rows[0];
    if (!i) throw new NotFoundError(`No company: ${handle}`);
    
    const jobSearch = await Job.findAll({companyHandle: i.handle})
    // i.handle = company_handle used as a filter to see if jobs are attached
    console.log(jobSearch)
    
    // Does the company have a job attached?
    if(jobSearch.length == 0) {
      let companyRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`,[handle]);

         let c = companyRes.rows[0];
         
      return {
        name: c.name,
        handle: c.handle,
        description: c.description,
        num_employees: c.numEmployees,
        logo_url: c.logoUrl,
      }
    } else {
        let companyRes = await db.query(
          `SELECT c.handle,
          c.name,
          c.description,
          c.num_employees AS "numEmployees",
          c.logo_url AS "logoUrl",
          j.id,
          j.title,
          j.salary,
          j.equity,
          j.company_handle AS "companyHandle"
          FROM companies AS c
          JOIN jobs AS j ON c.handle = j.company_handle
          WHERE c.handle = $1`,[handle]);
          
          let c = companyRes.rows[0];
          
          return {
            name: c.name,
            handle: c.handle,
            description: c.description,
            num_employees: c.numEmployees,
            logo_url: c.logoUrl,
            jobs: {
              id: c.id,
              title: c.title,
              salary: c.salary,
              equity: c.equity,
              companyHandle: c.companyHandle
            }
          };
        }
      }
        
        /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;

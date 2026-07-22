import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students } from '@db/db.js';
import { type Student, type Course } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /api/students
// get students, can filter by studentId and/or program
app.get("/api/students", (req: Request, res: Response) => {
  try {
    // get value from query string, example: /api/students?studentId=650610001
    const studentId = req.query.studentId as string;
    const program = req.query.program as string;

    // start with all students
    let filtered_students = students;

    // if user sent studentId, filter it
    if (studentId !== undefined) {
      filtered_students = filtered_students.filter(function (student) {
        return student.studentId === studentId;
      });
    }

    // if user also sent program, filter it too
    if (program !== undefined) {
      filtered_students = filtered_students.filter(function (student) {
        return student.program === program;
      });
    }

    return res.json({
      ok: true,
      students: filtered_students,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
    });
  }
});

// POST /api/students, body = {new student data}
// add a new student
app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/api/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /api/students, body = {studentId}
// Update specified student
app.put("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/api/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /api/students, body = {studentId}
// remove a student from the system
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body;

    // check if studentId is valid (must be 9 characters)
    const result = zStudentDeleteBody.safeParse(body);
    if (result.success === false) {
      return res.status(400).json({
        ok: false,
        message: "Student Id must contain 9 characters",
      });
    }

    const studentId = body.studentId;

    // find the student we want to delete
    let foundIndex = -1;
    for (let i = 0; i < students.length; i++) {
      if (students[i].studentId === studentId) {
        foundIndex = i;
      }
    }

    // not found in the system
    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student ID does not exist",
      });
    }

    // found, so delete it from the array
    students.splice(foundIndex, 1);

    return res.status(200).json({
      ok: true,
      message: "Student Id " + studentId + " has been deleted",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
    });
  }
});

// GET /api/me
// show name and studentId of the person who made this
app.get("/api/me", (req: Request, res: Response) => {
  return res.json({
    ok: true,
    fullName: "กิตติพิชญ์ เมฆอรุณกมล",
    studentId: "680610655",
  });
});

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;
import express, { type Request, type Response } from 'express';


import morgan from "morgan";

import { students } from './db/db.js';
import { type Student, type Course } from "./libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "./libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;


app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'


app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});


app.get("/api/students", (req: Request, res: Response) => {
  try {

    const studentId = req.query.studentId as string;
    const program = req.query.program as string;


    let filtered_students = students;

    if (studentId !== undefined) {
      filtered_students = filtered_students.filter(function (student) {
        return student.studentId === studentId;
      });
    }


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


app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

   
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

   
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

   
    const new_student = body;
    students.push(new_student);

   
    res.set("Link", `/api/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});


app.put("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

   
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

  
    students[foundIndex] = { ...students[foundIndex], ...body };


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


app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body;


    const result = zStudentDeleteBody.safeParse(body);
    if (result.success === false) {
      return res.status(400).json({
        ok: false,
        message: "Student Id must contain 9 characters",
      });
    }

    const studentId = body.studentId;


    let foundIndex = -1;
    for (let i = 0; i < students.length; i++) {
      if (students[i].studentId === studentId) {
        foundIndex = i;
      }
    }

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student ID does not exist",
      });
    }


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
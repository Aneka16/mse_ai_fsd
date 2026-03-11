require("dotenv").config();
const dns = require("dns").promises;
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

/* ---------------- MongoDB Connection ---------------- */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ---------------- Patient Schema ---------------- */

const patientSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phoneNumber: {
    type: String,
    required: true
  },

  age: {
    type: Number,
    required: true,
    min: 0
  },

  gender: {
    type: String,
    enum: ["Male","Female","Other"],
    required: true
  },

  disease: {
    type: String,
    required: true
  },

  doctorAssigned: {
    type: String,
    required: true
  },

  admissionDate: {
    type: Date,
    required: true
  },

  roomNumber: {
    type: String
  },

  patientType: {
    type: String,
    enum: ["Inpatient","Outpatient"],
    required: true
  },

  status: {
    type: String,
    enum: ["Admitted","Discharged"],
    default: "Admitted"
  }

},{timestamps:true});

const Patient = mongoose.model("Patient", patientSchema);

/* ---------------- CREATE Patient ---------------- */

app.post("/patients", async (req,res)=>{
  try{

    const patient = new Patient(req.body);

    await patient.save();

    res.status(201).json(patient);

  }catch(error){

    res.status(400).json({message:error.message});

  }
});

/* ---------------- GET All Patients ---------------- */

app.get("/patients", async (req,res)=>{
  try{

    const patients = await Patient.find();

    res.status(200).json(patients);

  }catch(error){

    res.status(500).json({message:error.message});

  }
});

app.get("/patients/search", async (req,res)=>{
  try{

    const name = req.query.name;

    const patients = await Patient.find({
      fullName: { $regex: name, $options: "i" }
    });

    res.status(200).json(patients);

  }catch(error){

    res.status(500).json({message:error.message});

  }
});

/* ---------------- GET Patient by ID ---------------- */

app.get("/patients/:id", async (req,res)=>{
  try{

    const patient = await Patient.findById(req.params.id);

    if(!patient){
      return res.status(404).json({message:"Patient not found"});
    }

    res.status(200).json(patient);

  }catch(error){

    res.status(500).json({message:error.message});

  }
});

/* ---------------- UPDATE Patient ---------------- */

app.put("/patients/:id", async (req,res)=>{
  try{

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true}
    );

    if(!patient){
      return res.status(404).json({message:"Patient not found"});
    }

    res.status(200).json(patient);

  }catch(error){

    res.status(400).json({message:error.message});

  }
});

/* ---------------- DELETE Patient ---------------- */

app.delete("/patients/:id", async (req,res)=>{
  try{

    const patient = await Patient.findByIdAndDelete(req.params.id);

    if(!patient){
      return res.status(404).json({message:"Patient not found"});
    }

    res.status(200).json({message:"Patient deleted successfully"});

  }catch(error){

    res.status(500).json({message:error.message});

  }
});

/* ---------------- SEARCH Patient ---------------- */

app.get("/patients/search", async (req,res)=>{
  try{

    const name = req.query.name;

    const patients = await Patient.find({
      fullName: {$regex:name,$options:"i"}
    });

    res.status(200).json(patients);

  }catch(error){

    res.status(500).json({message:error.message});

  }
});

/* ---------------- Server ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});
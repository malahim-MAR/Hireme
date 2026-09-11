import Note from "../models/Note.js";

// Get All Notes
export const getAllNotes = async (req, res) => {
  try {
    const note = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(note);
  } catch (error) {
    console.error("Error On getAllNote Method", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Note By ID

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note Not Found" });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Error On getNoteById Method", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create Note

export const createNote = async (req, res) => {
  try {
    const { First_Name, Last_Name, Job_Title, Email, Phone, Company, Cover_Letter, Status } = req.body;
    const note = new Note({
      First_Name,
      Last_Name,
      Job_Title,
      Email,
      Phone,
      Company,
      Cover_Letter,
      Status: Status || "Applied",
    });

    const savedNote = await note.save();
    res.status(201).send(savedNote);
  } catch (error) {
    console.error("Error On createNote Method", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Note

export const updateNote = async (req, res) => {
  try {
    const { First_Name, Last_Name, Job_Title, Email, Phone, Company, Cover_Letter, Status } = req.body;
    const UpdatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { First_Name, Last_Name, Job_Title, Email, Phone, Company, Cover_Letter, ...(Status && { Status }) },
      { new: true }
    );

    if (!UpdatedNote) {
      return res.status(404).json({ message: "Note Not Found" });
    }

    return res.status(200).json({
      message: "Note updated successfully",
      note: UpdatedNote,
    });
  } catch (error) {
    console.error("Error On updateNote Method", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete Note
export const deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    if (!deletedNote) {
      // returning here prevents second response
      return res.status(404).json({ message: "Note Not Found" });
    }

    // single success response
    return res.status(200).json({ message: "Note Deleted Successfully" });
  } catch (error) {
    console.error("Error On deleteNote Method", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

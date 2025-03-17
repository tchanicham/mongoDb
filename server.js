require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000; // Utilisation de la variable d'environnement

// Middleware pour traiter le JSON
app.use(express.json());

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/taskDB") // Supprime les options obsolètes
    .then(() => console.log(" MongoDB connecté"))
    .catch(err => {
        console.error(" Erreur de connexion MongoDB :", err);
        process.exit(1); // Quitte l'application en cas d'échec
    });

// Modèle de la tâche
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: "" },
    completed: { type: Boolean, default: false }
});

const Task = mongoose.model("Task", taskSchema); // Nom du modèle corrigé

// Route principale
app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur mon API!" });
});

// ➤ Création d'une tâche
app.post("/tasks", async (req, res) => {
    try {
        const { title, content, completed } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Le champ 'title' est obligatoire" });
        }

        const newTask = new Task({ title, content, completed });
        await newTask.save();

        res.status(201).json({ message: "Tâche créée avec succès", task: newTask });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});

// ➤ Récupération de toutes les tâches
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json({ message: "Liste des tâches", tasks });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});

// ➤ Récupération d'une tâche par ID
app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        res.json({ message: "Tâche trouvée", task });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});

// ➤ Mise à jour d'une tâche
app.put("/tasks/:id", async (req, res) => {
    try {
        const { title, content, completed } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, content, completed },
            { new: true, runValidators: true } // `new: true` pour renvoyer la nouvelle version
        );

        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        res.json({ message: "Tâche mise à jour", task });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});

// ➤ Suppression d'une tâche
app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        res.json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});

// ➤ Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

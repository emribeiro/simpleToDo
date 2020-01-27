const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/simpleToDoDb', {useNewUrlParser: true, useUnifiedTopology: true });

const taskSchema = mongoose.Schema({
    name: String,
    status: {type: Number, default: 1},
    order: {type: Number, default: 99999},
    is_priority: Boolean,
    created_at: {type: Date, default: Date.now},
    updated_at: Date,
    finished_at: Date
})

const Task = mongoose.model('Task', taskSchema);

const toDoSchema = mongoose.Schema({
    name: String,
    created_at: {type: Date, default: Date.now},
    tasks : [taskSchema],

})

const ToDo = mongoose.model('ToDo', toDoSchema);

app.get("/", (req, res) => {


    ToDo.find((err, toDos) => {
        console.log(toDos);
        return res.render("home", {toDos: toDos});
    });

});


app.post("/newToDo", (req, res) => {
    const toDoName = req.body.toDoName;
    var todo = new ToDo({name: toDoName, tasks: []});

    todo.save((err, todo) => {
        if(err){
            console.log(err.stack());
        }else{
            console.log(todo);

            res.redirect("/");
        }
    });

});

app.get("/todo/:id", (req, res) => {

    const id = req.params.id;
    console.log(id);

    ToDo.findById(id, (err, todo) => {
        if(err){
            console.log(err.stack);
        }else{
            console.log(todo);
            return res.render("todo", {todo: todo});
        }
    });
    
});

app.listen(3000, function(){
    console.log("Application stated in port 3000");
})
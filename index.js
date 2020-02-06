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
    is_priority: {type: Boolean, default: false},
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
            res.redirect("/");
        }
    });

});

app.get("/todo/:id", (req, res) => {

    const id = req.params.id;

    ToDo.findById(id, (err, todo) => {
        if(err){
            console.log(err.stack);
        }else{
            console.log(todo);
            return res.render("todo", {todo: todo});
        }
    });
    
});

app.post("/todo/:id/newTask", function(req, res){
    const id = req.params.id;
    const taskName = req.body.taskName;
    
    task = new Task({name: taskName});

    ToDo.findOneAndUpdate({_id: id}, {$push: {tasks: task}}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            console.log(result);
        }
    });

    return res.redirect("/todo/"+id);
});


app.get("/todo/:id/delete", (req, res) => {
    const id = req.params.id;

    ToDo.deleteOne({"_id" : id}, (err) => {
        if(err){
            console.log(err);
        }
    });

    return res.redirect("/");
});
app.get("/todo/:id/done/:taskId", (req, res) =>{
    const id = req.params.id;
    const taskId = req.params.taskId;

    ToDo.findOneAndUpdate({'_id': id, 'tasks._id' : taskId}, {$set: {'tasks.$.status': 3}}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            console.log(result);
        }
    });

    return res.redirect("/todo/"+id);

});

app.get("/todo/:id/delete/:taskId", (req, res) =>{
    const id = req.params.id;
    const taskId = req.params.taskId;

    ToDo.findOneAndUpdate({'_id': id}, {$pull: {'tasks' : {_id: taskId }}}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            console.log(result);
        }
    });

    return res.redirect("/todo/"+id);

});

app.listen(3000, function(){
    console.log("Application stated in port 3000");
})
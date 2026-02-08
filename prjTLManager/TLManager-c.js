/**
 *  teodeloso@gmail.com
 *  
 *  process user interactions using REST API
 * 
 */

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = window.APP_CONFIG.RESTAPIURL;
    document.getElementById("comp-prog").href = window.APP_CONFIG.COMPPROGURL;
    document.getElementById('yr').textContent = new Date().getFullYear();

    // maximum tasks allowed
    const MAX_TASKS = 10;

    // grab elements needed (DOM references)
    const todoList = document.getElementById("todoList");                       // <ul> container
    const newTaskInput = document.getElementById("newTaskInput");               // input for new task
    const addTaskBtn = document.getElementById("addTaskBtn");                   // "Add Task" button
    const limitMessage = document.getElementById("limitMessage");               // message shown when max reached
    const dbContentContainer = document.getElementById("DBContentContainer");   // for displaying the db content

    let timer = null;

    // helper function - starts time to communicate server
    function startServerTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        let msgServer = "Communicating to server... "
        let seconds = 0;
        setLimitMessage(msgServer + "[" +seconds + "s]");

        timer = setInterval(() => {
                seconds++;
                setLimitMessage(msgServer + "[" +seconds + "s]");
            }, 1000
        );
    }

    // helper function - stops time to communicate server
    function stopServerTimer() {
        clearInterval(timer);
        timer = null;
        setLimitMessage("");
    }

    // helper function - generate unique id for each task
    function generateId() {
        return Date.now().toString();
    }

    // helper function - displays the database content (in JSON format)
    //                   This helps you see current state
    // function DisplayDBContent(dbData) {
    //     // JSON.stringify(..., null, 2) formats it nicely with indentation
    //     dbContentContainer.textContent = JSON.stringify(dbData, null, 2);
    // }

    // helper function - find a task in the database by its id
    async function findTodoById(id) {
        const res = await fetch(API_URL);
        const dbData = await res.json();

        return dbData.find(todo => todo.id === id);
    }

    // helper function - returns true if a task can still be added to the database
    async function canAddTask() {
        const res = await fetch(API_URL);
        const dbData = await res.json();

        return dbData.length < MAX_TASKS;
    }

    /**
     *  Display all the tasks from the database.
     *  Clears the <ul> then rebuilds it using the current db content
     * 
     *  Read (GET) operation
     */
    async function loadData(){
        startServerTimer();

        // retreive all tasks from the database
        const res = await fetch(API_URL);
        const dbData = await res.json();

        // clear current tasks displayed (if any)
        todoList.innerHTML = "";

        // go through each item in the database
        dbData.forEach(dbDataItm => {

            // create the DOM of the dbDataItm.
            // this is the <li>
            const li = document.createElement("li");

            li.classList.add("listitm");

            // store the dbDataItm id on the <li> so we can find it in event delegation
            li.dataset.id = dbDataItm.id;
            
            // build the <li> content of the task.
            // this is a row that contains a checkbox, text field, delete button
            li.innerHTML = `
                <input type="checkbox" ${dbDataItm.status === "1" ? "checked" : ""}>
                <input type="text" value="${dbDataItm.task}" ${dbDataItm.status === "1" ? "readonly" : ""}>
                <button class="delete-btn add-del-btn">Delete</button>
            `;

            // add the <li> to the <ul>
            todoList.appendChild(li);
        });

        // display db content (JSON format) to keep it current
        //DisplayDBContent(dbData);

        stopServerTimer();
    }

    /**
     *  Saves a task to the database.
     * 
     *  Create (POST) operation
     */
    async function saveData(id, task, status){
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id, 
                                "task": task, 
                                "status": status})
        });

        // display db content (JSON format) to keep it current
        loadData();
    }

    /**
     *  updates a task status in the database.
     * 
     *  Update (PATCH) operation
     */
    async function updateDataStatus(id, status) {
        await fetch(API_URL, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id, 
                                "status": status})
        });

        // display db content (JSON format) to keep it current
        loadData();
    }

    /**
     *  updates a task name in the database.
     * 
     */
    async function updateDataTask(id, task) {
        await fetch(API_URL, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id, 
                                "task": task})
        });

        // display db content (JSON format) to keep it current
        loadData();
    }

    /**
     *  deletes a task in the database.
     * 
     *  Delete (DELETE) operation
     */
    async function deleteData(todoId) {
        
        //append data id in the url
        await fetch(API_URL + "/" + todoId, {
            method: "DELETE"});

        // display db content (JSON format) to keep it current
        loadData();
    }


    /**
     *  Update the limit message text.
     *  This is message displayed in <p> for db max limit
    */
    function setLimitMessage(text) {
        limitMessage.textContent = text;
    }

    /**
     *  Event Handler.
     *  Handles adding a new task when the Add Task button is clicked.
     */
    function handleAddTask() {

        // remove extra spaces
        const taskText = newTaskInput.value.trim();

        // if the input is empty, do nothing
        if (!taskText) return;

        // check max task limit
        // alternative to !(await canAddTask())
        canAddTask().then(
            canAddTask => {
                if ( !canAddTask ) {
                    setLimitMessage("Task limit reached (" + MAX_TASKS + " max).");
                    return;
                } else {
                    // add new task to the database.
                    // default status = 0
                    saveData(generateId(), taskText, "0");

                    // clear input after adding
                    newTaskInput.value = "";
                    
                    // clear any previous limit message
                    setLimitMessage("");
                }
            }
        );
    }

    /**
     *  Event Handler.
     *  Handles click events inside the <ul>.
     *  Uses event delegation instead of individual listeners.
     */
    function handleListClick(event) {

        // find nearest <li>
        const listItem = event.target.closest("li");

        // click not inside a list item
        if (!listItem) return;

        // get id from dataset
        const todoId = listItem.dataset.id;

        // find corresponding object
        const todo = findTodoById(todoId);

        // if clicked checkbox
        if (event.target.type === "checkbox") {

            // update status in database
            todo.status = event.target.checked ? "1" : "0";
            updateDataStatus(todoId, todo.status);

            // disable editing if checked
            const textInput = listItem.querySelector('input[type="text"]');
            textInput.readOnly = todo.status === "1";
        }

        // if click textbox
        if (event.target.type === "text") {

            const textInput = listItem.querySelector('input[type="text"]');

            if (!textInput.readOnly) {
                const listBtn = listItem.querySelector('button');
                listBtn.textContent = "Update";
            }
        }

        // if clicked delete button
        if (event.target.classList.contains("delete-btn")) {
            
            const listBtn = listItem.querySelector('button');
            
            if (listBtn.textContent === "Delete") {               
                // remove task from database
                deleteData(todoId);

                // clear any limit message
                setLimitMessage("");
            }

            if (listBtn.textContent === "Update") {
                
                const textInput = listItem.querySelector('input[type="text"]');
                const updatedInput = textInput.value.trim();

                if ( updatedInput ) {
                    // update task in the database
                    updateDataTask(todoId, updatedInput);

                    listBtn.textContent = "Delete";
                }
            }
        }
    }

     /**
     *  Event Handler.
     *  Handles text input changes inside the <li> (edit task name).
     */
    function handleListInput(event) {

        // find nearest <li>
        const listItem = event.target.closest("li");

        // click not inside a list item
        if (!listItem) return;

        // get id from dataset
        const todoId = listItem.dataset.id;

        // find corresponding object
        const todo = findTodoById(todoId);

        // only update if the input is the text input
        if (event.target.type === "text") {
            todo.task = event.target.value;
        }
    }

    // event listener - add task button
    addTaskBtn.addEventListener("click", handleAddTask);

    // event listeners - event delegation on the <ul> container
    todoList.addEventListener("click", handleListClick);
    todoList.addEventListener("input", handleListInput);

    /**
     *  Initial display of the database content (if any)
     */
    loadData();
});

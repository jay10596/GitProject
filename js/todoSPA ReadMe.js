1) Create a project
	npx create-react-app todo_spa //Can't have capital letters in React

	cd todo_spa

	npm start

	[1.1] Add FontAwesome
		npm i --save @fortawesome/fontawesome-svg-core
		npm install --save @fortawesome/free-solid-svg-icons
		npm install --save @fortawesome/react-fontawesome					/



2) Add Git repository
	[2.1] Create a repo on Git

	[2.2] Go to terminal of the project directory (VS Code)
		git init

		git add .

		git commit -m "Initial Commit"

		#ssh Remote
			git remote add origin git@github.com:jay10596/Forum-SPA.git

			#Follow this documentation to set ssh key if required
				https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

			git push -u origin master
					ssh key password: password
		
			#OR

		#http Remote
			git remote set-url origin https://github.com/jay10596/Blog-SPA.git

			git config --global user.email "jay.modi105@gmail.com"

			git config credential.username "jay10596"

			git push origin TailWindDashboard10QuizQuestion

			Password for 'https://jay10596@github.com':
				d53df5af046a2df9ae410b6caae2eb672f807e69



3) Basics of React
	#src->index.js
		import React from 'react';
		import ReactDOM from 'react-dom';
		import './index.css';
		import App from './App';
		import Demo from "./Demo";
		import * as serviceWorker from './serviceWorker';

		// ReactDom.render(What I want to render, Where do I want to render it). Usually it would give an error because <> are considered as greater than and Less than signs. However, as we are importing Rect, it will convert it into JSX and work as an HTML element.
		// Demo.js (Boilerplate)
		ReactDOM.render(<Demo show="true" />, document.getElementById('root'));

		// App.js (Todo app)
		// ReactDOM.render(<App />, document.getElementById('root'));

		// To work offline and load faster, can change unregister() to register()
		serviceWorker.unregister();

	// Separate Componant with inline Styling
	#src->components->Demo.js
		import React, {Component} from "react";

		//Functional Component
		/*
		    function Demo(props) {
		        let newStyle = {
		            color: 'yellow',
		            backgroundColor: 'blue', // background-color: won't work because it contains '-' and we are using JSX syntax. Therefore, replace - with camelCase
		            fontSize: 20,
		            margin: '25px'
		        }

		        const hours = new Date().getHours()

		        if(hours == 12) {
		            newStyle.color = 'white'
		        } else if (hours > 12) {
		            newStyle.color = 'black'
		        }

		        // Can't use style="" because everything inside return will be in JSX and it must be a object, else it will be considered as a string.
		        return(
		            <div style={newStyle}>
		                // display can be used to check if the passed prop contains the value or not. If not, the display will be none.
		                <ul style={{display: props.show ? 'block' : 'none'}}>UFC - PPV Time: {hours}
		                // style={{display: !show && 'none'}} //another way of saying if show is null, display will be none.
		                    <li>Nate</li>
		                    <li>Conor</li>
		                    <li>Jorge</li>
		                </ul>
		            </div>
		        )
		    }
		*/

		//Class Component
		/*
		    Changes to make:
		        1) Change function abc() to class abc extends React.Component { ...
		        2) Whatever was inside function abc() {...}, move it inside render() {...}. The render() render() works as a JSX function component.
		        3) If you don't pass props as parameter, directly use this.props to access props. You can pass the props only in constructor, not in render().
		        4) Add constructor() with super and this.state = {}. Here state is similar to data in Vue
		        5) Bind any extra functions (if there is) in the constructor.
		 */
		class Demo extends Component {
		    constructor(props) {
		        super(props)

		        this.state = {
		            count: 0,
		            display: props.show,
		            loggedIn: false,
		            first: '',
		            last: '',
		            isFriendly: true,
		            gender: '',
		            favColor: ''
		        }

		        this.increaseCount = this.increaseCount.bind(this)
		        this.hideDisplay = this.hideDisplay.bind(this)
		        this.handleChange = this.handleChange.bind(this)
		        this.changeLogin = this.changeLogin.bind(this)
		    }

		    render() {
		        let newStyle = {
		            color: 'yellow',
		            backgroundColor: 'blue', // background-color: won't work because it contains '-' and we are using JSX syntax. Therefore, replace - with camelCase
		            fontSize: 20,
		            margin: '25px'
		        }

		        const hours = new Date().getHours()

		        // Changing text color for a specific operation
		        if(hours === 12) {
		            newStyle.color = 'white'
		        } else if (hours > 12) {
		            newStyle.color = 'black'
		        }

		        // Conditional Statement outside JSX
		        let buttonText = this.state.loggedIn ? 'Logout' : 'Log In'
		        let loginMessage = this.state.loggedIn ? 'User is logged in' : 'User is logged out'

		        // Can't use style="" because everything inside return will be in JSX and it must be a object, else it will be considered as a string.
		        return(
		            <div style={newStyle}>
		                {/* display can be used to check if the passed prop contains the value or not. If not, the display will be none.
		                    in the Class component, props are not passed as parameter which is why we call them using this.props */}
		                <ul style={{display: this.state.display ? 'block' : 'none'}}>UFC - PPV Time: {hours}
		                    {/* style={{display: !show && 'none'}} //another way of saying if show is null, display will be none. */}
		                    <li>Nate</li>
		                    <li>Conor</li>
		                    <li>Jorge</li>
		                </ul>

		                <p>{this.state.count}</p>

		                <button onClick={this.increaseCount}>Count</button>

		                <button onClick={this.hideDisplay}>Hide Display</button>

		                {/* Input Binding (name and value similar to v-model)*/}<br/><br/>
		                <form onSubmit={this.handleSubmit}>
		                    <input type="text" name="first" value={this.state.first} onChange={this.handleChange} placeholder="First name" />
		                    <input type="text" name="last" value={this.state.last} onChange={this.handleChange} placeholder="Last Name "/> <br/>
		                    <h4>{this.state.first} {this.state.last}</h4>

		                    <input type="checkbox" name="isFriendly" checked={this.state.isFriendly} onChange={this.handleChange} /> is friendly? <br/>

		                    <input type="radio" name="gender" value='male' checked={this.state.gender === 'male'} onChange={this.handleChange} /> Male
		                    <input type="radio" name="gender" value='female' checked={this.state.gender === 'female'} onChange={this.handleChange} /> Female
		                    <h4>You are a {this.state.gender}</h4>

		                    <select name="favColor" value={this.state.favColor} onChange={this.handleChange}>
		                        <option value=''>Select one</option>
		                        <option value="blue!">Blue</option>
		                        <option value="green!">Green</option>
		                        <option value="yellow!">Yellow</option>
		                    </select>
		                    <h4>Your fav color is {this.state.favColor}</h4>

		                    {/* Button inside a form is by default a submit button in HTML5 */}
		                    <button>Submit</button>
		                </form>

		                {/* Conditional statement (v-if) inside JSX
		                    {this.state.loggedIn ?
		                        <div>
		                            <button onClick={this.changeLogin}>Logout</button>
		                            <h1>User is logged in.</h1>
		                        </div>
		                        :
		                        <div>
		                            <button onClick={this.changeLogin}>Login</button>
		                            <h1>User is logged out</h1>
		                        </div>
		                    }
		                */}

		                {/*  Conditional Statement performed outside JSX  */}
		                <div>
		                    <button onClick={this.changeLogin}>{buttonText}</button>
		                    <h1>{loginMessage}</h1>
		                </div>
		            </div/>
		        )
		    }

		    increaseCount() {
		        this.setState({
		            count: this.state.count + 1
		        })
		    }

		    hideDisplay() {
		        this.setState({
		            display: ! this.state.display
		        })
		    }

		    handleChange(e) {
		        e.target.type === 'checkbox' ?
		            this.setState({[e.target.name]: e.target.checked})
		            :
		            this.setState({[e.target.name]: e.target.value})
		    }

		    handleSubmit() {
		        alert('Submitted!')
		    }

		    changeLogin() {
		        this.setState({
		            loggedIn: ! this.state.loggedIn
		        })
		    }
		}

		export default Demo



4) ToDo & Meme App
	[4.1] Two different approaches // We will go with the 2nd approach

		1) Todos - Functional, Todo - Class
			#src->components->Todos->Todos.js
				import React, {Component} from "react";
				import './Todos.css'
				import Todo from './Todo/Todo'
				import todosData from "../../TodosData";

				//Functional Component
				function Todos() {
				    const todosArray = todosData.map(todo => <Todo data={todo} key={todo.id} />)

				    return(
				        <div>
				            {todosArray}
				        </div/>
				    )
				}

				export default Todos

			#src->components->Todos->Todo->Todo.js
				import React, {Component} from "react";

				//Class Component
				class Todo extends Component {
				    constructor(props) {
				        super(props)
				        this.state = {
				            completed: props.data.completed
				        }
				        this.changeCompleted = this.changeCompleted.bind(this)
				    }

				    render() {
				        return(
				            <div>
				                <input type="checkbox" checked={this.state.completed} onChange={this.changeCompleted} />
				                <p>{this.props.data.title}</p>
				            </div>
				        )
				    }

				    changeCompleted() {
				        this.setState({
				            completed: ! this.state.completed
				        })
				    }
				}

				export default Todo



		2) Todos - Class, Todo - Functional
			#src->components->Todos->Todos.js
				import React, {Component} from "react";
				import './Todos.css'
				import Todo from './Todo/Todo'
				import todosData from "../../TodosData";

				//Class Component
				class Todos extends Component {
				    constructor() {
				        super()
				        this.state = {
				            todos: todosData
				        }
				        this.changeCompleted = this.changeCompleted.bind(this)
				    }

				    render() {
				        const todosArray = todosData.map(todo => <Todo data={todo} key={todo.id} changeCompleted={this.changeCompleted} />)

				        return(
				            <div>
				                {todosArray}
				            </div>
				        )

				        /* If we are not reading the data from another file, array or an object
				            return(
				                <div>
				                    //Passing an object
				                    <Todo data = {{id: 1, title: "Wake up at 6 and get ready for work.", completed: false}}/>
				                    <Todo data = {{id: 2, title: "Finish laundry and take dinner.", completed: true}}/>

				                    Passing a single value
				                    <Todo title="Finish laundry and take dinner."/>
				                </div>
				            )
				        */
				    }

				    changeCompleted(id) {
				        this.setState(prevState => {
				            const updatedTodos = prevState.todos.map(todo => {
				                if (todo.id === id) {
				                    todo.completed = !todo.completed
				                }
				                return todo
				            })
				            return {
				                todos: updatedTodos
				            }
				        })
				    }
				}

				export default Todos

			#src->components->Todos->Todo->Todo.js
				import React, {Component} from "react";

				//Functional Component
				function Todo(props) {
				    return(
				        <div>
				            <input type="checkbox" checked={props.data.completed} onChange={() => props.changeCompleted(props.data.id)} />
				            <p>{props.data.title}</p>
				        </div>
				    )
				}

				export default Todo


	[4.2] Final App 
		[4.2.1] Index & App
			#src->index.js
				import React from 'react';
				import ReactDOM from 'react-dom';
				import './index.css';
				import App from './App';
				import Demo from "./Demo";
				import * as serviceWorker from './serviceWorker';

				// ReactDom.render(What I want to render, Where do I want to render it). Usually it would give an error because <> are considered as greater than and Less than signs. However, as we are importing Rect, it will convert it into JSX and work as an HTML element.
				// Demo.js (Boilerplate)
				// ReactDOM.render(<Demo show="true" />, document.getElementById('root'));

				// App.js (Todo app)
				ReactDOM.render(<App />, document.getElementById('root'));

				// To work offline and load faster, can change unregister() to register()
				serviceWorker.unregister();

			#src->App.js
				import React from "react";
				import "./App.css"
				import Todos from "./components/Todos/Todos";
				import Meme from "./components/Meme/Meme";

				function App() {
				    return(
				        <div className="App">
				            <header>To-Do & Meme App</header>

				            <div className="split-screen">
				                <Todos />
				                <Meme />
				            </div>

				            <footer><p className="footer-border">by Jay Modi</p></footer>
				        </div>
				    )
				}

				export default App

			#src->App.css
				.App {
				    text-align: center;
				}

				.split-screen {
				    width: 100%;
				    display: flex;
				    margin: 25px 0px;
				}

				header {
				    padding: 5%;
				    font-size: xx-large;
				    font-weight: bolder;
				    font-family: sans-serif;
				    background: linear-gradient(to right, deeppink, yellow, dodgerblue, hotpink);
				    -webkit-text-fill-color: transparent;
				    -webkit-background-clip: text;
				    text-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
				}

				footer {
				    padding: 1%;
				}

				.footer-border {
				    margin-left: 40%; /* Doing it this way because we are not using div or p tag inside the footer */
				    margin-right: 40%;
				    text-align: center;
				    padding: 1%;
				    border: 2px solid red;
				    border-image: linear-gradient(to right, gray 0%, grey 25%, yellow 25%, yellow 50%,red 50%, red 75%, teal 75%, teal 100%) 1;
				}


		[4.2.1] Todos & Todo components
			#src->components->Todos->Todos.js
				import React, {Component} from "react";
				import './Todos.css'
				import Todo from './Todo/Todo'
				import todosData from "../../TodosData";

				//Functional Component (Can't add input field in it as we need to bind it with state)
				/*
				    function Todos() {
				        const todosArray = todosData.map(Todo => <Todo data={Todo} key={Todo.id} />)

				        return(
				            <div>
				                {todosArray}
				            </div>
				        )
				    }
				*/

				//Class Component
				class Todos extends Component {
				    constructor() {
				        super()

				        this.state = {
				            todos: todosData,
				            inputTitle: ''
				        }

				        this.changeCompleted = this.changeCompleted.bind(this)
				        this.handleChange = this.handleChange.bind(this)
				        this.addTodo = this.addTodo.bind(this)
				        this.deleteTodo = this.deleteTodo.bind(this)
				        this.editTodo = this.editTodo.bind(this)
				    }

				    render() {
				        /* We will display directly rather than using {todosArray in the return(}
				            const todosArray = todosData.map(todo => <Todo data={todo} key={todo.id} changeCompleted={this.changeCompleted} />)
				        */

				        const todosArray = todosData.map(todo => <Todo data={todo} key={todo.id} changeCompleted={this.changeCompleted} deleteTodo={this.deleteTodo} editTodo={this.editTodo} />)


				        return(
				            <div className="left-section">
				                <input type="text" value={this.state.inputTitle} onChange={this.handleChange} />
				                <button onClick={this.addTodo}>Add</button>

				                {todosArray}
				            </div>
				        )

				        /* If we are not reading the data from another file, array or an object
				            return(
				                <div>
				                    //Passing an object
				                    <Todo data = {{id: 1, title: "Wake up at 6 and get ready for work.", completed: false}}/>
				                    <Todo data = {{id: 2, title: "Finish laundry and take dinner.", completed: true}}/>

				                    Passing a single value
				                    <Todo title="Finish laundry and take dinner."/>
				                </div>
				            )
				        */
				    }

				    changeCompleted(id) {
				        this.setState(prevState => {
				            const updatedTodos = prevState.todos.map(todo => {
				                if (todo.id === id) {
				                    todo.completed = !todo.completed
				                }
				                return todo
				            })
				            return {
				                todos: updatedTodos
				            }
				        })
				    }

				    handleChange(e) {
				        this.setState({
				            inputTitle: e.target.value
				        })
				    }

				    addTodo() {
				        let newTodo = {
				            id: this.state.todos.length + 2, // Adding 2 rather than 1 because if we splice, length + 1 will be equal to the id of the last element
				            title: this.state.inputTitle,
				            completed: false
				        }

				        // Can't push it directly inside the setState. It will not work properly.
				        this.state.todos.push(newTodo)

				        this.setState({
				            todos: this.state.todos,
				            inputTitle: ''
				        })
				    }

				    deleteTodo(id) {
				        this.state.todos.splice(this.state.todos.findIndex(function(todo){
				            return todo.id === id
				        }), 1)

				        this.setState({
				            todos: this.state.todos,
				        })
				    }

				    editTodo(todo) {
				        //let todo = this.state.todos.find(todo => todo.id === id)

				        this.deleteTodo(todo.id)

				        this.setState({
				            inputTitle: todo.title,
				        })
				    }
				}

				export default Todos

			#src->components->Todos->Todos.css
				.left-section {
				    flex: 1;
				}


			#src->components->Todos->Todo->Todo.js
				import React, {Component} from "react";
				import './Todo.css'
				// Class Component
				/*
				    class Todo extends Component {
				        constructor(props) {
				            super(props)
				            this.state = {
				                completed: props.data.completed
				            }
				            this.changeCompleted = this.changeCompleted.bind(this)
				        }

				        render() {
				            const completedStyle = {
				                fontStyle: 'italic',
				                color: 'gray',
				                textDecoration: 'line-through'
				            }

				            return(
				                <div>
				                    <input type="checkbox" checked={this.state.completed} onChange={this.changeCompleted} />
				                    <p style={this.state.completed ? completedStyle : null}>{this.props.data.title}</p>
				                </div>
				            )
				        }

				        changeCompleted() {
				            this.setState({
				                completed: ! this.state.completed
				            })
				        }
				    }
				*/

				// Functional Component
				function Todo(props) {
				    const completedStyle = {
				        fontStyle: 'italic',
				        color: 'gray',
				        textDecoration: 'line-through'
				    }

				    return(
				        <div className='todo-design'>
				            <input type="checkbox" checked={props.data.completed} onChange={() => props.changeCompleted(props.data.id)} />

				            <p style={props.data.completed ? completedStyle : null}>{props.data.title}</p>

				            <button onClick={() => props.deleteTodo(props.data.id)} className='delete-button'>Delete</button>

				            <button onClick={() => props.editTodo(props.data)} className='edit-button'>Edit</button>
				        </div>
				    )
				}

				export default Todo

			#src->components->Todos->Todo->Todo.css
				.todo-design {
				    display: flex;
				    justify-content: center;
				    align-items: center;
				    text-align: left;
				    margin: 25px 0px;
				}

				input {

				}

				p {
				    margin: 5px;
				}

				button {
				    margin: 0px 5px;
				}

				.delete-button {
				    color: #CE3717;
				    background-color: whitesmoke;
				    font-weight: bold;
				    padding: 6px;
				    font-size: small;
				    text-align: center;
				    text-decoration: none;
				    border-radius: 8px;
				    border: none;
				    box-shadow: 1px 2px lightslategray;
				}

				.delete-button:focus {
				    outline: none;
				}

				.delete-button:hover {
				    color: antiquewhite;
				    background-color: #CE3717;
				}

				.edit-button {
				    color: #119C28;
				    background-color: whitesmoke;
				    font-weight: bolder;
				    padding: 6px;
				    font-size: small;
				    text-align: center;
				    text-decoration: none;
				    border-radius: 8px;
				    border: none;
				    box-shadow: 1px 2px lightslategray;
				}

				.edit-button:focus {
				    outline: none;
				}


				.edit-button:hover {
				    color: antiquewhite;
				    background-color: #119C28;
				}


		[4.2.2] Meme component
			#src->components->Meme->Meme.js
				import React, {Component} from "react";
				import './Meme.css'
				import Form from "./Form/Form";
				import Display from "./Display/Display";

				class Meme extends Component {
				    constructor() {
				        super()

				        this.state = {
				            loading: true,
				            meme: [],
				            topLine: '',
				            bottomLine: ''
				        }

				        this.fetchImage = this.fetchImage.bind(this)
				        this.handleChange = this.handleChange.bind(this)
				        this.handleSubmit = this.handleSubmit.bind(this)
				    }

				    // Similar to created() or mounted() in Vue
				    componentDidMount() {
				        this.fetchImage()
				    }

				    render() {
				        /* Can't use it because for loading we need <p>, and for image we need <img>
				            let status = this.state.loading ? 'Loading...' : this.state.meme
				        */
				        return(
				            <div className="right-section">
				                <Form data={this.state} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />

				                {this.state.loading ? <p className="loader"></p> : <Display data={this.state} fetchImage={this.fetchImage} />}
				            </div/>
				        )
				    }

				    fetchImage() {
				        fetch('https://api.imgflip.com/get_memes')
				            .then(res => res.json())
				            .then(res => {
				                this.setState({
				                    loading: false,
				                    meme: res.data.memes[Math.floor(Math.random() * res.data.memes.length)].url,
				                })
				            })
				    }

				    handleChange(e) {
				        this.setState({
				            [e.target.name]: e.target.value
				        })
				    }

				    handleSubmit(e) {
				        e.preventDefault() // To avoid reloading the page
				        this.fetchImage()
				    }
				}

				export default Meme

			#src->components->Meme->Meme.css
				.right-section {
				    flex: 1;
				    position: relative;
				}

				img {
				    margin: 5%;
				    width: 50%;
				    height: 50%;
				}

				.top-text {
				    position: absolute;
				    left: 0;
				    right: 0;
				    text-align: center;

				    top: 0;
				    margin-top: 12%;

				    font-family: ".SF NS Mono";
				    font-size: xx-large;
				    font-weight: bolder;
				    color: whitesmoke;
				}

				.bottom-text {
				    position: absolute;
				    left: 0;
				    right: 0;
				    text-align: center;

				    bottom: 0;
				    margin-bottom: 10%;

				    font-family: ".SF NS Mono";
				    font-size: xx-large;
				    font-weight: bolder;
				    color: whitesmoke;
				}

				.loader {
				    position: absolute;
				    left: 50%;
				    margin: 20px 0px;

				    border: 4px solid lightgray; /* Light grey */
				    border-top: 4px solid dodgerblue; /* Blue */
				    border-radius: 50%;
				    width: 20px;
				    height: 20px;
				    animation: spin 2s linear infinite;
				}

				@keyframes spin {
				    0% { transform: rotate(0deg); }
				    100% { transform: rotate(360deg); }
				}

			#src->components->Meme->Form->Form.js
				import React from "react";

				function Form(props) {
				    return(
				        <div>
				            <form onSubmit={props.handleSubmit}>
				                <input type="text" name="topLine" value={props.data.topLine} onChange={props.handleChange} placeholder="Enter top line..." />
				                <input type="text" name="bottomLine" value={props.data.bottomLine} onChange={props.handleChange} placeholder="Enter bottom line..." />

				                <button>Make Meme</button>
				            </form>
				        </div/>
				    )
				}

				export default Form

			#src->components->Meme->Display->Display.js
				import React from "react";
				import '../Meme.css'

				function Display(props) {
				    return(
				        <div>
				            <p className="top-text">{props.data.topLine}</p>

				            <img src={props.data.meme} onClick={props.fetchImage} />

				            <p className="bottom-text">{props.data.bottomLine}</p>
				        </div>
				    )
				}

				export default Display


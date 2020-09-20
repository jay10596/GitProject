1) Create a project
	npx create-react-app imdb

	cd imdb

	npm start

	// React Router
	[1.1] Add react-router
		npm install react-router-dom

		[1.1.1] Basic Setup
			#src->index.js
				import React from 'react';
				import ReactDOM from 'react-dom';
				import * as serviceWorker from './serviceWorker';

				import App from './App';
				import './styles/main.css';
				import '../node_modules/font-awesome/css/font-awesome.min.css'

				ReactDOM.render(<App />, document.getElementById('root'));

				// If you want your app to work offline and load faster, you can change unregister() to register() below.
				serviceWorker.unregister();

			#src->App.js
				import React from 'react';
				import Navbar from "./components/navbar/Navbar";
				import RouterView from "./RouterView";
				import './styles/main.css'

				function App() {
				    return(
				        <div>
				            <Navbar />
				            <RouterView />
				        </div/>
				    )
				}

				export default App 									

			#src->RouterView.js
				import React from "react";
				import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom";
				import Home from "./pages/home/Home";
				import About from "./pages/about/About";

				function RouterView() {
				    return(
				        <div>
				            <BrowserRouter>
				                <Switch>
				                    <Route exact path='/' component={Home} />
				                    <Route path='/about' component={About} />

				                    {/* Redirect to Error Page if the url is invalid i.e=page doesn't exits
				                        <Route path="*" component={Error} />
				                     */}

				                    {/* Redirect to home if url is invalid */}
				                    <Route render={() => <Redirect to={{pathname: "/"}} />} />
				                </Switch>
				            </BrowserRouter>
				        </div/>
				    )
				}

				export default RouterView

			#src->components->Navbar.js
				import React from "react";
				import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

				function Navbar() {
				    return(
				        <div>
				            <h1 class='bg-green-500'>This is Navbar</h1>
				        </div>
				    )
				}

				export default Navbar

		[1.1.2] Check via adding router links
			#src->pages->Home.js
				import React from "react";
				import { Link } from "react-router-dom";

				function Home() {
				    return(
				        <div>
				            <h1>This is home</h1>
				            <Link to='/about'>About</Link>
				        </div/>
				    )
				}

				export default Home

			#src->pages->About.js
				import React from "react";
				import {Link} from "react-router-dom";

				function About() {
				    return(
				        <div>
				            <h1>This is about</h1>
				            <Link to='/'>Home</Link>
				        </div/>
				    )
				}

				export default About


	// TailwindCSS
	[1.2] Add TailwindCSS
		npm install tailwindcss autoprefixer postcss-cli

		npx tailwind init --full // Creates tailwind.config.js

		touch postcss.config.js

		#postcss.config.js
			module.exports = {
			    plugins: [
			        require('tailwindcss'),
			        require('autoprefixer'),
			    ],
			};

		// Create new directory
		#src->styles->tailwind.css // Replace css with tailwind directives.
			@tailwind base;

			@tailwind components;

			@tailwind utilities;

		#src->styles->main.css // Copy the resulting tailwind css code into main file which we will import in each js file.
			// Leave it empty for now

		// Modify the scripts
		#package.json
			...
			"scripts": {
			    "start": "npm run build:css && react-scripts start",
			    "build": "npm run build:css && react-scripts build",
			    "test": "react-scripts test",
			    "eject": "react-scripts eject",
			    "build:css": "postcss src/styles/tailwind.css -o src/styles/main.css"
			},
			...

		npm start // It will copy the result of postcss of tailwind css into main.css

	// FontAwesome
	[1.3] Add FontAwesome
		[1.3.1] Use it as React Component // Not prefered, time consuming)  
			// Follow the documentation for more advance features as library.
			npm i --save @fortawesome/fontawesome-svg-core
			
			npm install --save @fortawesome/free-solid-svg-icons
			
			npm install --save @fortawesome/react-fontawesome	/

			// Without Library
			#src->index.js 
				import ReactDOM from 'react-dom'
				import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
				import { faCoffee } from '@fortawesome/free-solid-svg-icons'

				const element = <FontAwesomeIcon icon={faCoffee} />

				ReactDOM.render(element, document.body)			

			// With Library
			#src->FontAwsomeIcons.js
				import { library } from '@fortawesome/fontawesome-svg-core'
				import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons'

				library.add(faCheckSquare, faCoffee)

			#src->index.js 
				import React from 'react';
				import ReactDOM from 'react-dom';
				import * as serviceWorker from './serviceWorker';

				// import App from './App';
				import './styles/main.css';
				import './FontAwsomeIcons'

				import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

				// ReactDOM.render(<App />, document.getElementById('root'));
				ReactDOM.render(<FontAwesomeIcon icon="coffee" />, document.getElementById('root'));

				// If you want your app to work offline and load faster, you can change unregister() to register() below.
				serviceWorker.unregister();

		[1.3.2] Using the React-Icon// Prefered way
			npm install react-icons --save

			#index.js
				import React from 'react';
				import ReactDOM from 'react-dom';
				import * as serviceWorker from './serviceWorker';

				// import App from './App';
				import './styles/main.css';
				import { FaBeer } from 'react-icons/fa';

				// ReactDOM.render(<App />, document.getElementById('root'));
				ReactDOM.render(<FaBeer />, document.getElementById('root'));

				// If you want your app to work offline and load faster, you can change unregister() to register() below.
				serviceWorker.unregister();		



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

3) Final App
	[3.1] Basic
		#src->index.js
			import React from 'react';
			import ReactDOM from 'react-dom';
			import * as serviceWorker from './serviceWorker';
			import {BrowserRouter} from "react-router-dom";

			import App from './App';
			import './styles/main.css';

			ReactDOM.render(<BrowserRouter><App /></BrowserRouter> , document.getElementById('root'));

			// If you want your app to work offline and load faster, you can change unregister() to register() below.
			serviceWorker.unregister();

		#src->App.js
			import React from 'react';
			import Router from './Router';
			import './styles/main.css'


			// Unlike Vue, RouterLink does not exit. Therefore, we need to import all routers. We can't define basic app structure with changing router-view because then we will not e able to use router Link inside the Nav or Footer component.
			function App() {
			    return(
			        <div>
			            <Router />
			        </div/>
			    )
			}

			export default App 

		#src->Router.js
			import React from "react";
			import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom";
			import Home from "./pages/Home";
			import About from "./pages/About";

			function Router() {
			    return(
			        <div>
			            <BrowserRouter>
			                <Switch>
			                    <Route exact path='/' component={Home} />
			                    <Route path='/about/:id' component={About} />

			                    {/* Redirect to Error Page if the url is invalid i.e=page doesn't exits
			                        <Route path="*" component={Error} />
			                     */}

			                    {/* Redirect to home if url is invalid */}
			                    <Route render={() => <Redirect to={{pathname: "/"}} />} />
			                </Switch>
			            </BrowserRouter>
			        </div/>
			    )
			}

			export default Router

		#src->Config.js
			// Configuration for TMDB Movies
			// To see the latest configuration fetch it from https://api.themoviedb.org/3/configuration?api_key=019e8f375549e0bbd4a4191862ebc88f
			const API_URL = 'https://api.themoviedb.org/3/';
			const API_KEY = 'f920c34a945997d3691dd5f5e2d79a01';

			// Configuration for TMDB Images
			// An image URL looks like this example: http://image.tmdb.org/t/p/w780/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg
			const IMAGE_URL ='http://image.tmdb.org/t/p/';

			//Sizes: w300, w780, w1280, original
			const BACKDROP_SIZE = 'w1280';

			// w92, w154, w185, w342, w500, w780, original
			const POSTER_SIZE = 'w154';

			export {
			    API_URL,
			    API_KEY,
			    IMAGE_URL,
			    BACKDROP_SIZE,
			    POSTER_SIZE
			}


	[3.2] Pages
		#src->pages->Home.js
			import React, {Component} from "react";
			import { Link } from "react-router-dom"
			import Popular from "../components/Popular";
			import Trending from "../components/Trending";
			import Leaderboard from "../components/Leaderboard";
			import Searchbar from "../components/Searchbar";
			import Navbar from "../components/Navbar";
			import Footer from "../components/Footer";

			function Home() {
			    return(
			        <div>
			            <Navbar/>

			            <div className='mx-24'>
			                <Searchbar />

			                <Popular />

			                <Trending />

			                <Leaderboard />
			            </div>

			            <Footer />
			        </div/>
			    )
			}

			export default Home

		#src->pages->About.js
			import React from "react";
			import Detail from "../components/Detail";
			import Navbar from "../components/Navbar";
			import Footer from "../components/Footer";

			function About(props) {
			    // This only works in the component that's mentioned in the router. This command will not work in the child components which is why we will catch the id here and pass it as props in the child component.
			    let id = props.match.params.id

			    return(
			        <div>
			            <Navbar />

			            <Detail id={id} />

			            <Footer />
			        </div/>
			    )
			}

			export default About


	[3.3] Components
		#src->components->Components.css
			.design {
			    display: flex;
			    height: 350px;
			    transform: rotate(180deg);
			}

			.vertical {
			    width: 4px;
			    border-left: 4px solid black;
			    margin-right: 8px;
			    border-image: linear-gradient(to top, #21ADA8, rgba(0, 0, 0, 0)) 1 100%;
			    opacity: 0.5;
			}



			.multicolorText {
			    background: linear-gradient(to right, white, #99EEBB);
			    -webkit-text-fill-color: transparent;
			    -webkit-background-clip: text;
			}

			.multicolorLogo {
			    background: linear-gradient(to right, #99EEBB, #14B5D0);
			    -webkit-text-fill-color: transparent;
			    -webkit-background-clip: text;
			}

			/* This bg color is never visible if there is an image because image is always over the bg color */
			.imgBlueOverlay {
			    background-color: #2a4365;
			}

			/* To solve the issue mentioned above, we will lighten the image using opacity */
			.imgBlueOverlay img {
			    opacity: 0.1;
			}

			.centered {
			    position: absolute;
			    top: 32px;
			    left: 64px;
			    /* As it is absolute, it's not part of the div which is why w-full will not work and will go out of the image container. This is why we will leave the same px from the right side as well.*/
			    right: 64px;
			}

			/* You can use light-red and light-green as variables too */
			@value light-red: #f56565;
			@value light-green: #38b2ac;
			@value num: Math;

			.progress {
			    position: relative;
			    display: flex;
			    height: 8px;
			    border-radius: 25px;
			}

			.imgBlackOverlay {
			    background-color: rgba(0, 0, 0, 0.9)
			}

			/*
			    .button {
			        border-radius: 25px; // Equivalent to rounded-l-full rounded-r-full
			        font-size: medium;
			        padding: 4px 20px;
			    }
			*/

		#src->components->Navbar.js
			import React from "react";
			import { FaBell, FaPlus, FaSearch } from 'react-icons/fa';
			import {Link, BrowserRouter} from "react-router-dom";

			function Navbar() {
			    return(
			        <div className='bg-blue-900 py-2'>
			            <div className='mx-24 flex justify-between items-center'>
			                <div className='flex items-center'>
			                    <Link to='/'>
			                        <h1 className='text-3xl font-bold multicolorLogo'>TMDB</h1>
			                    </Link>

			                    <div className='py-6 px-2 ml-6 mr-10 mt-1 rounded-l-full rounded-r-full transform rotate-90 bg-gradient-to-t from-teal-400 to-blue-500'></div>

			                    <p className='mx-2 text-sm font-normal text-white'>Movies</p>
			                    <p className='mx-2 text-sm font-normal text-white'>TV</p>
			                    <p className='mx-2 text-sm font-normal text-white'>People</p>
			                </div>

			                <div className='flex items items-center text-white'>
			                    <FaPlus className='mx-4' />

			                    <p className='mx-4 text-xs font-normal border border-white p-1 rounded-sm'>EN</p>

			                    <FaBell className='mx-4' />

			                    <div className='mx-4 w-8 h-8 p-2 rounded-full font-semibold bg-purple-500 flex justify-center items-center'>El</div>

			                    <FaSearch className='mx-4 text-blue-400 text-xl' />
			                </div>
			            </div>
			        </div/>
			    )
			}

			export default Navbar

		#src->components->Footer.js
			import React from "react";

			function Footer() {
			    return(
			        <div className='bg-blue-900 h-80 flex justify-center items-center'>
			            <div className='mx-64 right-0 bottom-0 flex justify-center items-center'>
			                <div className='flex flex-col justify-end'>
			                    <img src="/FooterLogo.png" className='w-32 h-32 object-contain' alt="Footer Logo"/>

			                    <button className='py-1 px-2 text-blue-400 font-semibold bg-white rounded-lg'>el.aje</button>
			                </div>

			                <div className='flex ml-24'>
			                    <div className='pr-8 ml-2 text-gray-400 font-light'>
			                        <h1 className='font-semibold text-white text-lg'>THE BASICS</h1>

			                        <p>About TMDB</p>
			                        <p>Contact Us</p>
			                        <p>APi</p>
			                        <p>System</p>
			                    </div>

			                    <div className='pr-8 ml-2 text-gray-400 font-light'>
			                        <h1 className='font-semibold text-white text-lg'>GET INVOLVED</h1>

			                        <p>About TMDB</p>
			                        <p>Contact Us</p>
			                        <p>APi</p>
			                        <p>System</p>
			                    </div>

			                    <div className='pr-8 ml-2 text-gray-400 font-light'>
			                        <h1 className='font-semibold text-white text-lg'>COMMUNITY</h1>

			                        <p>About TMDB</p>
			                        <p>Contact Us</p>
			                        <p>APi</p>
			                        <p>System</p>
			                    </div>

			                    <div className='pr-8 ml-2 text-gray-400 font-light'>
			                        <h1 className='font-semibold text-white text-lg'>LEGAL</h1>

			                        <p>About TMDB</p>
			                        <p>Contact Us</p>
			                        <p>APi</p>
			                        <p>System</p>
			                    </div>
			                </div>
			            </div>
			        </div/>
			    )
			}

			export default Footer

		#src->components->Searchbar.js
			import React, { useState } from 'react';
			import {API_KEY, API_URL, BACKDROP_SIZE, IMAGE_URL, POSTER_SIZE} from "../config";
			import './Components.css'

			function Searchbar() {
			    // With useState Hook, you can use state in a functional component.
			    const [image, setImage] = useState(null);

			    fetch(`${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`)
			        .then(res => res.json())
			        .then(res => {
			            setImage(res.results[0].backdrop_path)
			        })

			    return(
			        <div className='relative'>
			            <div className="imgBlueOverlay">
			                {image ? <img src={`${IMAGE_URL}${BACKDROP_SIZE}//${image}`} className='w-full h-80 object-cover' alt="Poster"/> : null}
			            </div>

			            <div className='centered w-max'>
			                <p className='font-bold text-5xl text-white'>Welcome.</p>
			                <p className='font-semibold text-3xl text-white'>Millions of movies, TV shows and people to discover. Explore now.</p>

			                <div className=' flex items-center mt-16'>
			                    <input className='relative w-full py-2 pl-4 rounded-l-full rounded-r-full focus:outline-none' type="text" placeholder='Search Movie, TV Show or Actors...'/>
			                    <button className='right-0 absolute rounded-l-full rounded-r-full px-4 py-2.5 bg-gradient-to-t text-white font-semibold from-teal-400 to-blue-500'><p className='text-sm'>Search</p></button>
			                </div>
			            </div>
			        </div/>
			    )
			}

			export default Searchbar

		#src->components->Popular.js
			import React, {Component} from "react";
			import {API_KEY, API_URL} from "../config";
			import MovieCard from "./MovieCard";
			import './Components.css'

			class Popular extends Component {
			    constructor() {
			        super()

			        this.state = {
			            loading: false,
			            moviesTv: [],
			            tvMode: false
			        }

			        this.fetchPopularMovies = this.fetchPopularMovies.bind(this)
			        this.changeMode = this.changeMode.bind(this)
			    }

			    componentDidMount() {
			        this.setState({
			            loading:true
			        })

			        //From the api documentation
			        const endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`
			        this.fetchPopularMovies(endpoint)
			    }

			    render() {
			        const popularMoviesTV = this.state.moviesTv.map(movieTv => <MovieCard data={movieTv} key={movieTv.id} />)

			        return(
			            <div>
			                <div className='mx-12 my-4 flex items-center'>
			                    <h1 className='text-2xl font-normal font-sans mr-4'>What's Popular</h1>

			                    {
			                        this.state.tvMode ?
			                            <div className='w-max h-max border border-blue-900 rounded-l-full rounded-r-full'>
			                                <button onClick={() => this.changeMode(false)} className='py-1 px-3 rounded-l-full rounded-r-full bg-white focus:outline-none'><p className='text-sm font-semibold text-blue-900'>Movies</p></button>
			                                <button className='py-1 px-3 rounded-l-full rounded-r-full bg-blue-900 focus:outline-none'><p className='text-sm font-semibold multicolorText'>TV</p></button>
			                            </div>
			                            :
			                            <div className='w-max h-max border border-blue-900 rounded-l-full rounded-r-full'>
			                                <button className='py-1 px-3 rounded-l-full rounded-r-full bg-blue-900 focus:outline-none'><p className='text-sm font-semibold multicolorText'>Movies</p></button>
			                                <button onClick={() => this.changeMode(true)} className='py-1 px-3 rounded-l-full rounded-r-full bg-white focus:outline-none'><p className='text-sm font-semibold text-blue-900'>TV</p></button>
			                            </div>

			                    }
			                </div>

			                <div className='flex overflow-x-scroll py-2 h-max'>
			                    <div className='ml-12'></div>

			                    {popularMoviesTV}
			                </div>

			            </div>
			        )
			    }

			    fetchPopularMovies(endpoint) {
			        fetch(endpoint)
			            .then(res => res.json())
			            .then(res => {
			                this.setState({
			                    loading: false,
			                    moviesTv: res.results
			                })
			            })
			    }

			    changeMode(bool) {
			        this.setState({
			            tvMode: bool
			        })

			        const endpoint = bool ? `${API_URL}tv/popular?api_key=${API_KEY}&language=en-US&page=1` : `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`
			        this.fetchPopularMovies(endpoint)
			    }
			}

			export default Popular

		#src->components->Trending.js
			import React, {Component} from "react"
			import {API_KEY, API_URL} from "../config"
			import MovieCard from "./MovieCard"
			import './Components.css'

			class Trending extends Component {
			    constructor() {
			        super()

			        this.state = {
			            loading: false,
			            movies: []
			        }

			        this.fetchTrendingMovies = this.fetchTrendingMovies.bind(this)
			    }

			    componentDidMount() {
			        this.setState({
			            loading:true
			        })

			        //From the api documentation
			        const endpoint = `${API_URL}movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
			        this.fetchTrendingMovies(endpoint)
			    }

			    render() {
			        const trendingMovies = this.state.movies.map(movie => <MovieCard data={movie} key={movie.id} />)
			        let n = 300

			        return(
			            <div className='my-4'>
			                <h1 className='mx-12 text-2xl font-normal font-sans py-4'>Trending</h1>

			                <div className='relative flex overflow-x-scroll py-2 h-max'>
			                    <div className='design'>
			                        {[...Array(n)].map((e, i) => <div className="vertical" style={{height: Math.floor(Math.random() * 200) + 100}} key={i}></div>)}
			                    </div>

			                    <div className='absolute flex'>
			                        <div className='ml-12'></div>

			                        {trendingMovies}
			                    </div>
			                </div>
			            </div>
			        )
			    }

			    fetchTrendingMovies(endpoint) {
			        fetch(endpoint)
			            .then(res => res.json())
			            .then(res => {
			                this.setState({
			                    loading: false,
			                    movies: res.results
			                })
			            })
			    }

			}

			export default Trending

		#src->components->Leaderboard.js
			import React from "react";

			function Leaderboard() {
			    var n1 = 0
			    var n2 = 0
			    return(
			        <div className='mx-12 my-8'>
			            <div className='flex justify-start items-center'>
			                <h1 className='text-2xl font-normal font-sans mr-8'>Leaderboard</h1>

			                <div>
			                    <div className='flex justify-start items-center'>
			                        <div className='w-2 h-2 rounded-full bg-gradient-to-r from-white to-teal-600'></div>

			                        <p className='mx-2 text-sm font-light'>All Time Edits</p>
			                    </div>

			                    <div className='flex justify-start items-center'>
			                        <div className='w-2 h-2 rounded-full bg-gradient-to-r from-white to-red-600'></div>

			                        <p className='mx-2 text-sm font-light'>This Week</p>
			                    </div>
			                </div>
			            </div>

			            <div className='flex justify-between w-full'>
			                <div className='w-1/2'>
			                    <div className='flex items-center my-8'>
			                        <img src="/pp1.jpg" className='w-16 h-16 rounded-full object-cover mr-4' alt="Footer Logo"/>

			                        <div className='w-full'>
			                            <p className='font-semibold'>Shahrukh Khan</p>

			                            <div className='flex items-center'>
			                                <div className="progress my-2" style={{width: `${n1 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #38b2ac, #38b2ac)'}}></div> <p className='mx-2 text-xs font-semibold'>{n1}%</p>
			                            </div>

			                            <div className='flex items-center'>
			                                <div className="progress" style={{width: `${n2 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #ed8936, #f56565)'}}></div> <p className='mx-2 text-xs font-semibold'>{n2}%</p>
			                            </div>
			                        </div>
			                    </div>

			                    <div className='flex items-center my-8'>
			                        <img src="/pp2.jpg" className='w-16 h-16 rounded-full object-cover mr-4' alt="Footer Logo"/>

			                        <div className='w-full'>
			                            <p className='font-semibold'>Conor McGregor</p>

			                            <div className='flex items-center'>
			                                <div className="progress my-2" style={{width: `${n1 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #38b2ac, #38b2ac)'}}></div> <p className='mx-2 text-xs font-semibold'>{n1}%</p>
			                            </div>

			                            <div className='flex items-center'>
			                                <div className="progress" style={{width: `${n2 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #ed8936, #f56565)'}}></div> <p className='mx-2 text-xs font-semibold'>{n2}%</p>
			                            </div>
			                        </div>
			                    </div>
			                </div>

			                <div className='w-1/2 mx-12'>
			                    <div className='flex items-center my-8'>
			                        <img src="/pp3.jpg" className='w-16 h-16 rounded-full object-cover mr-4' alt="Footer Logo"/>

			                        <div className='w-full'>
			                            <p className='font-semibold'>Nate Diaz</p>

			                            <div className='flex items-center'>
			                                <div className="progress my-2" style={{width: `${n1 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #38b2ac, #38b2ac)'}}></div> <p className='mx-2 text-xs font-semibold'>{n1}%</p>
			                            </div>

			                            <div className='flex items-center'>
			                                <div className="progress" style={{width: `${n2 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #ed8936, #f56565)'}}></div> <p className='mx-2 text-xs font-semibold'>{n2}%</p>
			                            </div>
			                        </div>
			                    </div>

			                    <div className='flex items-center my-8'>
			                        <img src="/pp4.jpg" className='w-16 h-16 rounded-full object-cover mr-4' alt="Footer Logo"/>

			                        <div className='w-full'>
			                            <p className='font-semibold'>Jorge Masvidal</p>

			                            <div className='flex items-center'>
			                                <div className="progress my-2" style={{width: `${n1 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #38b2ac, #38b2ac)'}}></div> <p className='mx-2 text-xs font-semibold'>{n1}%</p>
			                            </div>

			                            <div className='flex items-center'>
			                                <div className="progress" style={{width: `${n2 = randomNumber()}%`, backgroundImage: 'linear-gradient(to right, white, #ed8936, #f56565)'}}></div> <p className='mx-2 text-xs font-semibold'>{n2}%</p>
			                            </div>
			                        </div>
			                    </div>
			                </div>
			            </div>
			        </div>
			    )
			}

			function randomNumber() {
			    return Math.floor(Math.random() * 100).toString()
			}

			export default Leaderboard

		#src->components->MovieCard.js
			import React from "react";
			import { IMAGE_URL, POSTER_SIZE } from "../config"
			import {Link} from "react-router-dom";

			function MovieCard(movieTv) {
			    return(
			        <div className='mr-8'>
			            <Link to={`/about/${movieTv.data.id}`}>
			                <div className='relative w-36'>
			                    <img src={`${IMAGE_URL}${POSTER_SIZE}//${movieTv.data.poster_path}`} className='w-full rounded-lg' alt="Poster"/>

			                    <div className='absolute ml-4 -mt-4 flex justify-center items-center w-10 h-10 rounded-full bg-blue-900 shadow-2xl'>
			                        <p className='text-white text-xs font-medium'>{Math.round(movieTv.data.vote_average * 100) / 10}</p> <p className='text-white text-xxs mb-4'>%</p>
			                    </div>

			                    <p className='mx-2 mt-8 text-sm font-bold'>{movieTv.data.title || movieTv.data.name}</p>

			                    <p className='mx-2 text-gray-800 text-sm font-light'>{movieTv.data.release_date || movieTv.data.first_air_date}</p>
			                </div>
			            </Link>
			        </div>
			    )
			}

			export default MovieCard

		#src->components->Detail.js
			import React, {Component} from "react";
			import {API_KEY, API_URL, BACKDROP_SIZE, IMAGE_URL, POSTER_SIZE} from "../config";
			import { FaFilm } from 'react-icons/fa';
			import ActorCard from './ActorCard'

			class Detail extends Component{
			    constructor(props) {
			        super(props)

			        this.state = {
			            loading: true,
			            movie: []
			        }

			        this.fetchMovieDetail = this.fetchMovieDetail.bind(this)
			    }

			    componentDidMount() {
			        this.fetchMovieDetail()
			    }

			    render() {
			        const actors = this.state.movie.cast ? this.state.movie.cast.map(actor => <ActorCard data={actor} key={actor.id}  />) : null
			        // const url =
			        return(
			            this.state.loading ? null :
			                <div>
			                    <div className='relative w-full flex items-center justify-center'>
			                        <img src={`${IMAGE_URL}${BACKDROP_SIZE}//${this.state.movie.backdrop_path}`} className='w-full h-100 object-cover' alt="Background Image"/>

			                        <div className='absolute flex w-8/12 h-80 shadow-2xl'>
			                            <img src={`${IMAGE_URL}${POSTER_SIZE}//${this.state.movie.poster_path}`} className='w-64 object-cover' alt="Background Image"/>

			                            <div className='relative imgBlackOverlay w-full px-8 font-sans text-white'>
			                                <p className='text-4xl font-medium font-mono py-4'>{this.state.movie.title || this.state.movie.name}</p>

			                                <p className='text-md font-semibold'>PLOT</p>

			                                <p className='text-md'>{this.state.movie.overview}</p>

			                                <div className='absolute bottom-0 right-0 px-8 py-4 text-6xl'>
			                                    <FaFilm />
			                                </div>
			                            </div>
			                        </div>
			                    </div>

			                    <div className='flex justify-center items-center'>
			                        <div className='w-8/12 py-4'>
			                            <h1 className='text-2xl font-normal font-sans py-8'>Actors</h1>

			                            <div className='flex flex-wrap justify-between'>
			                                {actors}
			                            </div>
			                        </div>
			                    </div>
			                </div/>
			        )
			    }

			    // Using this function instead of componentDidMount because we need image url to display and as render is called first when the component is created, we will have error in the console. To avoid those errors, I can call this function in the render, or I can fetch data in componentDidMount and add if condition with <img> just like SearchBar component.
			    fetchMovieDetail() {
			        fetch(`${API_URL}movie/${this.props.id}?api_key=${API_KEY}&language=en-US`)
			            .then(res => res.json())
			            .then(res => {
			                this.setState({
			                    loading: false,
			                    movie: res
			                })
			            })

			        fetch(`${API_URL}movie/${this.props.id}/credits?api_key=${API_KEY}&language=en-US`)
			            .then(res => res.json())
			            .then(res => {
			                this.setState({
			                    loading: false,
			                    movie: Object.assign(this.state.movie, res)
			                })
			            })
			    }

			}

			export default Detail

		#src->components->ActorCard.js
			import React from "react";
			import {IMAGE_URL, POSTER_SIZE} from "../config";

			function ActorCard(props) {
			    return( props.data.profile_path ?
			        <div className='flex w-64 h-32 my-2'>
			            <img src={`${IMAGE_URL}${POSTER_SIZE}//${props.data.profile_path}`} className='w-5/12 object-cover' alt="Background Image"/>

			            <div className='w-7/12 bg-gray-900 text-white p-4'>
			                <p className='text-md font-semibold font-sans'>{props.data.name}</p>
			                <p className='text-sm py-2 font-serif'>{props.data.character}</p>
			            </div>
			        </div> : null
			    )
			}

			export default ActorCard









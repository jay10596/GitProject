1) Create a project
	laravel new todo
	
	composer require laravel/ui

	php artisan ui tailwindcss --auth

	npm install && npm run dev

	valet park

	Now run:- http://todo.test



2) Add Git repository
	[2.1] Cretae a repo on Git

	[2.2] Go to terminal of the project directory (VS Code)
		git init

		git add .

		git commit -m "Initial Commit"

		#ssh Remote
			git remote add origin git@github.com:jay10596/ToDo.git

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



3) Setup sqlite database
	[3.1] Create a new sqlite file in the database
		#database->database.sqlite	

	[3.2] Change to sqlite in the following files
		#.env
			DB_CONNECTION=sqlite

		#config->database
			'default' => env('DB_CONNECTION', 'sqlite')

	[3.3] Migrate the existing tables
		php artisan migrate



4) Perform backend operations
	[4.1] Create Model, Controller, Migration, Facotry and Seeder
		php artisan make:model Todo -mrf

		php artisan make:seeder TodosSeeder

		php artisan make:controller UserController


	[4.2] Modify Migration
		#users
			Schema::create('users', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->string('avatar')->nullable();
	            $table->string('email')->unique();
	            $table->timestamp('email_verified_at')->nullable();
	            $table->string('password');
	            $table->rememberToken();
	            $table->timestamps();
	        });

		#todos
			Schema::create('todos', function (Blueprint $table) {
	            $table->id();
	            $table->string('todo');
	            $table->boolean('completed')->default(0);
	            $table->timestamps();
	        });

	        php artisan migrate

	[4.3] Edit Model
		#Todo
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Todo extends Model
			{
			    protected $guarded = [];
			}

	[4.4] Modify Factory
		#database->factoriea->TodoFactory
			$factory->define(Todo::class, function (Faker $faker) {
			    return [
			        'todo' => $faker->sentence(6)
			    ];
			});


	[4.5] Use Factory in the Seeder
		#database->seeds->TodosSeeder
			public function run()
		    {
		        factory(Todo::class, 7)->create();
		    }

		#database->seeds->DatabaseSeeder
			public function run()
		    {
		        $this->call(TodosSeeder::class);
		    }

	[4.6] Modify controllers
		#TodoController
			<?php

			namespace App\Http\Controllers;

			use App\Todo;
			use Illuminate\Http\Request;

			class TodoController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('auth');
			    }
			    
			    public function index()
			    {
			        $todos = Todo::all();

			        return view('todos')->with('todos', $todos);
			    }

			    public function store(Request $request)
			    {
			        /* 1)
			            $todo = new Todo;
			            $todo->todo = $request->todo;
			            $todo->save();
			        */

			        /* 2)
			            Todo::create([
			                'todo' => $request->todo,
			            ]);
			         */
			        $data = request()->validate([
			            'todo' => 'required'
			        ]);

			        Todo::create($data);

			        return redirect()->back();
			    }

			    public function edit(Todo $todo)
			    {
			        return view('todos/update')->with('todo', $todo);
			    }

			    public function update(Request $request, Todo $todo)
			    {
			        $data = request()->validate([
			            'todo' => 'required'
			        ]);

			        $todo->update($data);

			        return redirect('/todos');
			    }


			    public function destroy(Todo $todo)
			    {
			        $todo->delete();

			        return redirect()->back();
			    }
			}

		#UserController
			<?php

			namespace App\Http\Controllers;

			use Illuminate\Http\Request;
			use Auth;
			use App\User;

			class UserController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('auth');
			    }

			    public function index()
			    {
			        $user = Auth::user();

			        return view('profile')->with('user', $user);
			    }

			    public function create()
			    {
			        //
			    }

			    public function store(Request $request)
			    {
			        //
			    }

			    public function show($id)
			    {
			        //
			    }

			    public function edit(User $user)
			    {
			        return view('user/update')->with('user', $user);
			    }

			    public function update(Request $request, User $user)
			    {
			        if($request->hasFile('avatar')) {
			            $imageName = $request->avatar->getClientOriginalName();
			            $request->avatar->storeAs('public', $imageName);
			        
			            $request->user()->avatar = $imageName;
			            $request->user()->save();
			        }

			        $data = request()->validate([
			            'name' => 'required',
			            'email' => 'required'
			        ]);
			        
			        $user->update($data);

			        

			        return redirect('/todos');
			    }//php artisan storage:link

			    public function destroy($id)
			    {
			        //
			    }
			}

	[4.7] Define routes
		#routes->web.php
			<?php

			use Illuminate\Support\Facades\Route;

			Route::get('/', function () {
			    return view('welcome');
			});

			/// Todos
			Route::get('/todos', 'TodoController@index');

			Route::post('/todos', 'TodoController@store')->name('todo.create');

			Route::get('/todos/{todo}', 'TodoController@destroy')->name('todo.delete');
			/*Can't assign method Delere because in blade, methods are only assigned in forms.
			For delete I'm using link which only takes a GET request*/

			Route::get('/todos/{todo}/edit', 'TodoController@edit')->name('todo.edit');
			Route::put('/todos/{todo}', 'TodoController@update')->name('todo.update');
			///

			// User
			Route::get('/profile', 'UserController@index');

			Route::get('/users/{user}/edit', 'UserController@edit')->name('user.edit');
			Route::put('/users/{user}', 'UserController@update')->name('user.update');

			Route::post('/upload', 'ImageController@upload')->name('avatar.upload');
			///

			Auth::routes();

			Route::get('/home', 'HomeController@index')->name('home');
			Auth::routes();

			Route::get('/home', 'HomeController@index')->name('home');



5) Perform fromtend operations
	[5.1] Redirect user to todos page once logged-in/registered
		#app->provider->RouteServiceProvider
			public const HOME = '/todos';

	[5.2] Frontend CRUD
		#resources->views->layouts->app.blade.php //Display profile pic in the menu
			<!doctype html>
			<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
			<head>
			    <meta charset="utf-8">
			    <meta name="viewport" content="width=device-width, initial-scale=1">

			    <!-- CSRF Token -->
			    <meta name="csrf-token" content="{{ csrf_token() }}">

			    <title>{{ config('app.name', 'Laravel') }}</title>

			    <!-- Scripts -->
			    <script src="{{ asset('js/app.js') }}" defer></script>
			    
			    <!-- Styles -->
			    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
			</head>
			<body class="bg-gray-100 h-screen antialiased leading-none">
			    <div id="app">
			        <nav class="bg-blue-900 shadow mb-8 py-6">
			            <div class="container mx-auto px-6 md:px-0">
			                <div class="flex items-center justify-center">
			                    <div class="mr-6">
			                        <a href="{{ url('/') }}" class="text-lg font-semibold text-gray-100 no-underline">
			                            {{ config('app.name', 'Laravel') }}
			                        </a>
			                    </div>
			                    <div class="flex-1 text-right justify-end">
			                        @guest
			                            <a class="no-underline hover:underline text-gray-300 text-sm p-3" href="{{ route('login') }}">{{ __('Login') }}</a>
			                            @if (Route::has('register'))
			                                <a class="no-underline hover:underline text-gray-300 text-sm p-3" href="{{ route('register') }}">{{ __('Register') }}</a>
			                            @endif
			                        @else
			                            <div class="flex justify-end items-center">
			                                @if(Auth::user()->avatar)
			                                    <img src="/storage/{{auth()->user()->avatar}}" alt="Profile Pic" class="w-12 h-12 rounded-full object-cover">
			                                @endif

			                                <a href = "/profile" class="p-3 text-gray-300 text-sm">{{ Auth::user()->name }}</a>

			                                <a href="{{ route('logout') }}"
			                                
			                                class="no-underline hover:underline text-gray-300 text-sm p-3"
			                                onclick="event.preventDefault();
			                                        document.getElementById('logout-form').submit();">{{ __('Logout') }}</a>
			                                <form id="logout-form" action="{{ route('logout') }}" method="POST" class="hidden">
			                                    {{ csrf_field() }}
			                                </form>
			                            </div>
			                        @endguest
			                    </div>
			                </div>
			            </div>
			        </nav>

			        @yield('content')
			    </div>
			</body>
			</html/>

		#resources->views->welcome.blade.php //Add link to the todos page instead of home
			<!DOCTYPE html>
			<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
			<head>
			    <meta charset="utf-8">
			    <meta http-equiv="X-UA-Compatible" content="IE=edge">
			    <meta name="viewport" content="width=device-width, initial-scale=1">

			    <!-- CSRF Token -->
			    <meta name="csrf-token" content="{{ csrf_token() }}">

			    <title>{{ config('app.name', 'Laravel') }}</title>

			    <!-- Styles -->
			    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
			</head>
			<body class="bg-gray-100 h-screen antialiased leading-none">
			<div class="flex flex-col">
			    @if(Route::has('login'))
			        <div class="absolute top-0 right-0 mt-4 mr-4">
			            @auth
			                <a href="{{ url('/todos') }}" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase">{{ __('Home') }}</a>
			            @else
			                <a href="{{ route('login') }}" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase pr-6">{{ __('Login') }}</a>
			                @if (Route::has('register'))
			                    <a href="{{ route('register') }}" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase">{{ __('Register') }}</a>
			                @endif
			            @endauth
			        </div>
			    @endif

			    <div class="min-h-screen flex items-center justify-center">
			        <div class="flex flex-col justify-around h-full">
			            <div>
			                <h1 class="text-gray-600 text-center font-light tracking-wider text-5xl mb-6">
			                    {{ config('app.name', 'Laravel') }}
			                </h1>
			                <ul class="list-reset">
			                    <li class="inline pr-8">
			                        <a href="https://laravel.com/docs" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="Documentation">Documentation</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://laracasts.com" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="Laracasts">Laracasts</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://laravel-news.com" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="News">News</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://nova.laravel.com" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="Nova">Nova</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://forge.laravel.com" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="Forge">Forge</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://vapor.laravel.com" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="Vapor">Vapor</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://github.com/laravel/laravel" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="GitHub">GitHub</a>
			                    </li>
			                    <li class="inline pr-8">
			                        <a href="https://tailwindcss.com" class="no-underline hover:underline text-sm font-normal text-teal-800 uppercase" title="Tailwind Css">Tailwind CSS</a>
			                    </li>
			                </ul>
			            </div>
			        </div>
			    </div>
			</div>
			</body>
			</html>

		#resources->views->todos.blade.php
			@extends('layouts.app')

			@section('content')
			<div class="w-screen">
			    <div class="flex justify-center items-center">   
			        @if(count($errors))
			            @foreach($errors->all() as $error)
			                <p class="mr-64 text-sm text-red-600">
			                    *{{$error}}*
			                </p>
			            @endforeach
			        @endif
			    </div>
			</div>

			<form action="/todos" method="post" class="w-full flex justify-center items-center">
			    <label class="w-48 text-gray-800 font-bold md:text-right mb-1 pr-4">
			        Enter To-Do:
			    </label>

			    <div class="w-2/6">
			        {{csrf_field()}}
			        {{ method_field('POST') }}
			        <input class="bg-gray-200 appearance-none border border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" name="todo" placeholder="Enter To-Do">
			    </div>

			    <button type="submit" class="w-40 m-5 shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" >
			        Add To-Do
			    </button>
			</form>

			<div class="mx-40 w-4/6 my-20">
			    @foreach($todos as $todo)
			    <div class="flex justify-end items-center">
			        <p class="">{{$todo->todo}}</p>
			         
			        <a type="button" href = "{{route('todo.delete', ['todo' => $todo])}}" class="m-5 shadow bg-red-500 hover:bg-red-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-3 rounded" >
			            Delete
			        </a>

			        <a type="button" href = "{{route('todo.edit', ['todo' => $todo])}}" class="m-5 shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-3 rounded" >
			            update
			        </a>

			        <br>
			    </div>
			    @endforeach
			</div/>
			@endsection

		#resources->views->profile.blade.php
			@extends('layouts.app')

			@section('content')
			<div class="max-w-sm mx-auto my-auto border border-gray-500 rounded overflow-hidden shadow-lg">
			    @if(Auth::user()->avatar)
			        <img class="w-full" src="/storage/{{auth()->user()->avatar}}" alt="Profile Picture">
			    @endif
			    <div class="px-6 py-4">
			        <div class="font-bold text-xl mb-2">{{$user->name}}</div>
			        <p class="text-gray-700 text-base">
			            {{$user->email}}
			        </p>
			    </div>
			    
			    <div class="px-6 py-2">
			        <a href = "{{route('user.edit', ['user' => $user])}}" class="inline-block bg-gray-400 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">Edit Profile</a>
			    </div>
			</div>
			@endsection

		#resources->views->todos/update.blade.php
			@extends('layouts.app')

			@section('content')
			<div class="w-screen">
			    <div class="flex justify-center items-center">   
			        @if(count($errors))
			            @foreach($errors->all() as $error)
			                <p class="mr-64 text-sm text-red-600">
			                    *{{$error}}*
			                </p>
			            @endforeach
			        @endif
			    </div>
			</div>

			<form action="{{route('todo.update', ['todo' => $todo])}}" method="post" class="w-screen flex justify-center items-center">
			    {{csrf_field()}}
			    {{ method_field('PUT') }}
			    
			    <label class="w-48 text-gray-800 font-bold md:text-right mb-1 pr-4">
			        Update To-Do:
			    </label>

			    <div class="w-2/6">
			        <input value="{{$todo->todo}}" class="bg-gray-200 appearance-none border border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" name="todo" placeholder="Enter To-Do">
			    </div>

			    <button type="submit" class="w-40 m-5 shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" >
			        Update To-Do
			    </button>
			</form/>
			@endsection

		#resources->views->user/update.blade.php
			@extends('layouts.app')

			@section('content')

			<div class="w-screen">
			    <div class="flex justify-center items-center">   
			        @if(count($errors))
			            @foreach($errors->all() as $error)
			                <p class="mr-24 mb-4 text-sm text-red-600">
			                    *{{$error}}*
			                </p>
			            @endforeach
			        @endif
			    </div>
			</div>

			<form enctype="multipart/form-data" action="{{route('user.update', ['user' => $user])}}" method="post">
			    {{csrf_field()}}
			    {{ method_field('PUT') }}
			    
			    <div class="w-screen">
			        <div class="flex justify-center items-center">
			            <label class="w-48 text-gray-800 font-bold md:text-right mb-1 pr-4">
			                Name:
			            </label>

			            <div class="w-2/6">
			                <input value="{{$user->name}}" name="name" class="bg-gray-200 appearance-none border border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" placeholder="Enter To-Do">
			            </div>
			        </div>

			        <div class="my-5 flex justify-center items-center">
			            <label class="w-48 text-gray-800 font-bold md:text-right mb-1 pr-4">
			                Email:
			            </label>

			            <div class="w-2/6">
			                <input value="{{$user->email}}" name="email" class="bg-gray-200 appearance-none border border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" placeholder="Enter To-Do">
			            </div>
			        </div>

			        <div class="my-5 flex justify-center items-center">
			            <label class="w-48 text-gray-800 font-bold md:text-right mb-1 pr-4">
			                Profile Pic:
			            </label>

			            <div class="w-2/6">
			                <input type="file" name="avatar" class="bg-gray-200 appearance-none border border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" placeholder="Enter To-Do">
			            </div> 
			        </div>

			        <div class="my-5 mr-48 flex justify-center items-center">
			            <img src="/storage/{{auth()->user()->avatar}}" alt="Profile Pic" class="w-24 h-24 rounded-full object-cover">
			        </div>

			        <div class="flex justify-center items-center">
			            <button type="submit" class="w-32 mr-40 shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" >
			                Update
			            </button>
			        </div>
			           
			    </div>   
			</form>
			@endsection


















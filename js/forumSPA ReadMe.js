1) Create a project
	laravel new forumSPA



2) Add Git repository
	[2.1] Cretae a repo on Git

	[2.2] Go to terminal of the project directory (VS Code)
		git init

		git add .

		git commit -m "Initial Commit"

		git remote add origin git@github.com:jay10596/Forum-SPA.git

		#Follow this documentation to set ssh key if required
			https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

		git push -u origin master

			#OR

		git push origin master -f



3) Perform Model, Migration, Controller and Factories
	[3.1] Create Migration, ResourceController and Factory in one command

		#app->Model (Create a new folder)

		php artisan make:model Model/Question -mfr

		php artisan make:model Model/Reply -mfr

		php artisan make:model Model/Category -mfr

		php artisan make:model Model/Like -mfr

	[3.2] Add values in Migration
		#questions
			Schema::create('questions', function (Blueprint $table) {
	            $table->id();
	            $table->string('title');
	            $table->string('slug');
	            $table->text('body');
	            $table->unsignedBigInteger('category_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();
	        });

	    #categories
		    Schema::create('categories', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->string('slug');
	            $table->timestamps();
	        });

        #replies
	        Schema::create('replies', function (Blueprint $table) {
	            $table->id();
	            $table->text('body');
	            $table->unsignedBigInteger('question_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
	        });

        #likes
	        Schema::create('likes', function (Blueprint $table) {
	            $table->id();
	            $table->unsignedBigInteger('reply_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();
	        });



4) Setup mysql database
	[4.1] Open mysql and create the database
		#From the project's directory/VS code's terminal 	
			mysql

			create database bootcamp4;

						OR

		#From root directory/Mac terminal
			mysql -u root

			create database bootcamp4;

	[4.2] TablePlus -> Create a new connection -> MySQL -> User: root -> Connect
		#Open database bootcamp4

	[4.3] Edit .env file
		DB_DATABASE=bootcamp4

	[4.4] Exit mysql terminal and migrate to check if it works
		exit

		php aritsan migrate

	[4.5] Refresh TablePlus to check if it works



5) Relationship, Factories and Seeding
	[5.1] Add relationship in Models
		#user
			use App\Model\Question;
			use App\Model\Reply;

			public function questions()
		    {
		        return $this->hasMany(Question::class);
		    }

		    public function replies()
		    {
		        return $this->hasMany(Reply::class);
		    }

		#Question
			use App\User;

			public function user()
		    {
		        return $this->belongsTo(User::class);
		    }

		    public function replies()
		    {
		        return $this->hasMany(Reply::class);
		    }

		    public function category()
		    {
		        return $this->belongsTo(Category::class);
		    }

		#Reply
			use App\User;

			public function question()
		    {
		        return $this->belongsTo(Question::class);
		    }

		    public function user()
		    {
		        return $this->belongsTo(User::class);
		    }

		    public function likes()
		    {
		        return $this->hasMany(Like::class);
		    }

		#Category
			public function questions()
		    {
		        return $this->hasMany(Question::class);
		    }

	[5.2] Edit Factories
		#QuestionFactory
			use App\Model\Question;
			use App\Model\Category;
			use App\User;

			$factory->define(Question::class, function (Faker $faker) {
			    $title = $faker->sentence;

			    return [
			        'title' => $title,
			        'slug' => Str::slug($title),
			        'body' => $faker->text,
			        'category_id' => function() {
			            return Category::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#ReplyFactory
			use App\Model\Reply;
			use App\Model\Question;
			use App\User;

			$factory->define(Reply::class, function (Faker $faker) {
			    return [
			        'body' => $faker->text,
			        'question_id' => function() {
			            return Question::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#CategoryFactory
			$factory->define(Category::class, function (Faker $faker) {
			    $word = $faker->word;

			    return [
			        'name' => $word,
			        'slug' => Str::slug($word)
			    ];
			});

		#LikeFactory
			use App\Model\Like;
			use App\User;

			$factory->define(Like::class, function (Faker $faker) {
			    return [
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

	[5.3] Modify DatabaseSeeder
		factory(User::class, 10)->create();
        factory(Category::class, 5)->create();
        factory(Question::class, 10)->create();
        factory(Reply::class, 50)->create()->each(function($reply){
            return $reply->likes()->save(factory(Like::class)->make());
        });



6) Make Routes
	[6.1] routes->api:
		Route::apiResource('/questions', 'QuestionController');

		Route::apiResource('/categories', 'CategoryController');

		Route::apiResource('/questions/{question}/replies', 'ReplyController');

		Route::post('/{reply}/like', 'LikeController@likeIt');
		Route::delete('/{reply}/like', 'LikeController@unlikeIt');

		php arisan route:list



7) Make Controller and Resources
	[7.1] Question
		#QuestionController
			public function index()
		    {
		        return Question::latest()->get();
		    }
		    #Postman
				Get->http://127.0.0.1:8000/api/questions

			public function show(Question $question)
		    {
		        return $question;
		    }
		    #Postman
				Get->http://127.0.0.1:8000/api/questions/1

				#If you want to use some other attibute rather than id,
					#Question->Model
						public function getRouteKeyName()
				    	{
				    	   	return 'slug';
				    	}
				    	#Postman
							Get->http://127.0.0.1:8000/api/questions/blanditiis-dignissimos-omnis-ut-officiis-animi

			public function store(Request $request)
		    {
		        $question = new Question;
		        $question->title = $request->title;
		        ...
		        $question->save();
		    }
		    		#OR
		    public function store(Request $request)
		    {
		        Question::create($request->all());
		        return response('Created', 201);
		    }
		    		#OR (As we know that only logged in user can post a question)
		     public function store(Request $request)
		    {
		        auth()->user()->questions()->create($request->all());
		        return response('Created', 201);
		    }
		    #Question model (If you are using create($request->all())):
		    	protected $fillable = ['title', 'slug', 'body', 'category_id', 'user_id'];
		    		#OR
		    	protected $guarded = [];
		    #Postman
				Post->http://127.0.0.1:8000/api/questions
				Header:
					Accept: application/json
					Content-Type: application/json
				Body:
					title: this is title
					slug: this-is-title
					body: loren ipsum
					category_id: 1
					user_id: 1

			public function update(Request $request, Question $question)
		    {
		        $question->update($request->all());
		        return response('Updated', 202);
		    }
		    #Postman
				Put->http://127.0.0.1:8000/api/questions/11
				Header:
					Accept: application/json
					Content-Type: application/json
				Body:
					title: this is title 2
					slug: this-is-title-2
					body: loren ipsum

			public function destroy(Question $question)
		    {
		        $question->delete();
		        return response('Deleted', 201);
		    }
		    #Postman
				Delete->http://127.0.0.1:8000/api/questions/5

		#QuestionResource
			php artisan make:resource QuestionResource

			#Question Model
				public function getPathAttribute()
			    {
			        return asset("api/question/$this->slug");
			    }

			#QuestionResource
				public function toArray($request)
			    {
			        return [
			            'title' => $this->title,
			            'path' => $this->path,
			            'body' => $this->body,
			            'created_at' => $this->created_at->diffForHumans(),
			            'user' => $this->user->name,
			            'id' => $this->user_id
			        ];
			    }

		    #Question Controller
				use App\Http\Resources\QuestionResource;

				public function show(Question $question)
			    {
			        return new QuestionResource($question);
			    }

			    public function index()
			    {
			        return QuestionResource::collection(Question::latest()->get());
			    }

	[7.2] Category
		#CategoryResource
			php artisan make:resource CategoryResource

			public function toArray($request)
		    {
		        return [
		            'name' => $this->name,
		            'id' => $this->id
		        ];
		    }

		#CategoryController
			use Illuminate\Support\Str;
			use App\Http\Resources\CategoryResource;

			public function index()
		    {
		        return Category::latest()->get();
		    }
		    #Postman
				Get->http://127.0.0.1:8000/api/categories

		    public function show(Category $category)
		    {
		        return $category;
		    }
		    #Postman
				Get->http://127.0.0.1:8000/api/categories/1

				#If you want to use some other attibute rather than id,
					#Question->Model
						public function getRouteKeyName()
				    	{
				    	   	return 'slug';
				    	}
				    	#Postman
							Get->http://127.0.0.1:8000/api/categories/Laravel-Basics

			public function store(Request $request)
		    {
		        Question::create($request->all());
		        return response('Created', 201);

			}
		    		#OR
		    public function store(Request $request)
		    {
		        $category = new Category;
		        $category->name  = $request->name;
        		$category->slug  = Str::slug($request->name);
		        $category->save();

		        return response('Created', 201);
		    }
		    #Category model
			    	protected $guarded = [];
		    #Postman
				Post->http://127.0.0.1:8000/api/categories
				Header:
					Accept: application/json
					Content-Type: application/json
				Body:
					name: Laravel Basics

			public function update(Request $request, Category $category)
		    {
		        $category->update($request->all());
		        
		        return response('Updated', 202);
		    }
		    #Postman
				Put->http://127.0.0.1:8000/api/categories/1
				Header:
					Accept: application/json
					Content-Type: application/json
				Body:(select x-www-form-urluncoded instead of form-data)
					name: Laravel Foundations
					slug: Laravel-Foundations
		    			#OR
		    public function update(Request $request, Category $category)
		    {		        
		        $category->update(
		            [
		                'name' => $request->name,
		                'slug' => Str::slug($request->name)
		            ]
		        );

		        return response('Updated', 202);
		    }
		    #Postman
				Put->http://127.0.0.1:8000/api/categories/1
				Header:
					Accept: application/json
					Content-Type: application/json
				Body:(select x-www-form-urluncoded instead of form-data)
					name: Laravel Foundations

			public function destroy(Category $category)
		    {
		        $category->delete();
		        return response('Deleted', 201);
		    }
		    #Postman
				Delete->http://127.0.0.1:8000/api/categories/6

	[7.3] Reply
		#ReplyResource
			php artisan make:resource ReplyResource

			public function toArray($request)
		    {
		        return [
		            'id' => $this->id,
		            'body' => $this->body,
		            'user' => $this->user->name,
		            'created_at' => $this->created_at->diffForHumans(),
		        ];
		    }

		#ReplyController
			use App\Model\Question;
			use App\Http\Resources\ReplyResource;

			public function index(Question $question)
		    {
		        return ReplyResource::collection($question->replies);
		    }
		    #Postman
				Get->http://127.0.0.1:8000/api/questions/10/replies

			public function show(Question $question, Reply $reply)
		    {
		        return new ReplyResource($reply);
		    }
		    #Postman
				Get->http://127.0.0.1:8000/api/questions/10/replies/28

			public function store(Question $question, Request $request)
		    {
		        $reply = $question->replies()->create($request->all());
		        return response(['reply' => new ReplyResource($reply)], 201);
		    }
		    #Reply Model
			    protected $guarded = [];
			#Postman
				Post->http://127.0.0.1:8000/api/questions/10/replies
				Header:
					Accept: application/json
					Content-Type: application/json
				Body:
					body: this is reply
					user_id: 1
					question_id: 10

			public function update(Question $question, Request $request, Reply $reply)
			    {
			        $reply->update($request->all());
			        return response('Updated', 202);
			    }
			#Postman
				Post->http://127.0.0.1:8000/api/questions/10/replies/15
				Header:
					Accept: application/json
					Content-Type: application/json
				Body: (select x-www-form-urluncoded instead of form-data)
					body: This is Tianna, Bitch!

			public function destroy(Question $question,Reply $reply)
		    {
		        $reply->delete();
		        return response('Deleted', 201);
		    }
		    #Postman
				Delete->http://127.0.0.1:8000/api/questions/10/replies/51

	[7.4] Like
		#LikeController
			use App\Model\Reply;

			public function likeIt(Reply $reply)
		    {
		        $reply->likes()->create([ #reply_id will be added automatically
		            //'user_id' => auth()-> id(),
		            'user_id' => '1'
		        ]);
		    }
		    #LikeModel
				protected $guarded = [];
		    #Postman
				Post->http://127.0.0.1:8000/api/16/like

		    public function unlikeIt(Reply $reply)
		    {
		        //$reply->likes()->where(['user_id', auth()->id()])->first()->delete();
        		$reply->likes()->where('user_id', '1')->first()->delete();

		    }
		    #Postman
				Delete->http://127.0.0.1:8000/api/16/like



8) Add JWT
	[8.1] Go to: https://github.com/tymondesigns/jwt-auth and grab latest Tag

	[8.2] Composer.json
		"require": {
			....
			"tymon/jwt-auth": "1.0.0"
		}

		composer update

	[8.3] Go to the documentation section and follow the steps
		#Laravel Installation
			#Skip the first step: Installation 
				composer require tymon/jwt-auth (as we have installed manually)

			#Skip the second step: Add service provider ( Laravel 5.4 or below )
				Add the service provider to the providers array in the config/app.php config: (As we have Laravel > 5.4)

				'providers' => [

				    ...

				    Tymon\JWTAuth\Providers\LaravelServiceProvider::class,
				]

			#Publish the config
				php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

			#Generate secret key
				php artisan jwt:secret

		#Quick Start
			#Update User Model
				namespace App;

				use Illuminate\Contracts\Auth\MustVerifyEmail;
				use Illuminate\Notifications\Notifiable;
				use Illuminate\Foundation\Auth\User as Authenticatable;

				use Tymon\JWTAuth\Contracts\JWTSubject;
				use App\Model\Question;
				use App\Model\Reply;

				class User extends Authenticatable implements JWTSubject
				{
				    use Notifiable;

				    // Rest omitted for brevity

				    /**
				     * Get the identifier that will be stored in the subject claim of the JWT.
				     *
				     * @return mixed
				     */
				    public function getJWTIdentifier()
				    {
				        return $this->getKey();
				    }

				    /**
				     * Return a key value array, containing any custom claims to be added to the JWT.
				     *
				     * @return array
				     */
				    public function getJWTCustomClaims()
				    {
				        return [];
				    }
				}

			#Configure Auth guard
				'defaults' => [
				    'guard' => 'api',
				    'passwords' => 'users',
				],

				...

				'guards' => [
				    'api' => [
				        'driver' => 'jwt',
				        'provider' => 'users',
				    ],
				],

			#Add basic authentication routes in api
				Route::group([

				    'middleware' => 'api',
				    'prefix' => 'auth'

				], function ($router) {

				    Route::post('login', 'AuthController@login');
				    Route::post('logout', 'AuthController@logout');
				    Route::post('refresh', 'AuthController@refresh');
				    Route::post('me', 'AuthController@me');

				});

			#Create the AuthController
				php artisan make:controller AuthController

				#AuthController (Copy from the documentation)
					<?php

					namespace App\Http\Controllers;

					use Illuminate\Support\Facades\Auth;
					use App\Http\Controllers\Controller;

					class AuthController extends Controller
					{
					    /**
					     * Create a new AuthController instance.
					     *
					     * @return void
					     */
					    public function __construct()
					    {
					        $this->middleware('auth:api', ['except' => ['login']]);
					    }

					    /**
					     * Get a JWT via given credentials.
					     *
					     * @return \Illuminate\Http\JsonResponse
					     */
					    public function login()
					    {
					        $credentials = request(['email', 'password']);

					        if (! $token = auth()->attempt($credentials)) {
					            return response()->json(['error' => 'Unauthorized'], 401);
					        }

					        return $this->respondWithToken($token);
					    }

					    /**
					     * Get the authenticated User.
					     *
					     * @return \Illuminate\Http\JsonResponse
					     */
					    public function me()
					    {
					        return response()->json(auth()->user());
					    }

					    /**
					     * Log the user out (Invalidate the token).
					     *
					     * @return \Illuminate\Http\JsonResponse
					     */
					    public function logout()
					    {
					        auth()->logout();

					        return response()->json(['message' => 'Successfully logged out']);
					    }

					    /**
					     * Refresh a token.
					     *
					     * @return \Illuminate\Http\JsonResponse
					     */
					    public function refresh()
					    {
					        return $this->respondWithToken(auth()->refresh());
					    }

					    /**
					     * Get the token array structure.
					     *
					     * @param  string $token
					     *
					     * @return \Illuminate\Http\JsonResponse
					     */
					    protected function respondWithToken($token)
					    {
					        return response()->json([
					            'access_token' => $token,
					            'token_type' => 'bearer',
					            'expires_in' => auth()->factory()->getTTL() * 60
					        ]);
					    }
					}

					#Add signup 
						#AuthController
							use Illuminate\Http\Request;
							use App\User;

							$this->middleware('auth:api', ['except' => ['login', 'signup']]);


							public function signup(Request $request)
						    {
						        User::create($request->all());
						        return $this->login($request);
						    }

						#api.php
							Route::post('signup', 'AuthController@signup');

						#User Model
							public function setPasswordAttribute($value)
						    {
						        $this->attributes['password'] = bcrypt($value);
						    }



		#Use Postman to check
			#login
				Post: http://127.0.0.1:8000/api/auth/login
					Body:
						email: electa84@example.org (From MySQL TablePlus)
						password: password (From UserFactory)
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details -> Copy the token

			#me
				Post: http://127.0.0.1:8000/api/auth/me
					Authorization:
						Bearer Token: Paste the copied token 
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: User details

			#refresh
				Post: http://127.0.0.1:8000/api/auth/refresh (Details same as me)
					Authorization:
						Bearer Token: Paste the copied token 
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details -> Copy the token

				#Check me again:
					#Output: Unauthenticated

				#Paste the recently copied token
					#Output: User details

			#logout
				Post: http://127.0.0.1:8000/api/auth/logout (Details same as me)
					Authorization:
						Bearer Token: Paste the copied token 
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Successfully logged out

				#Check me again:
					#Output: Unauthenticated

			#signup
				Post: http://127.0.0.1:8000/api/auth/signup
					Body:
						name: test
						email: test@test.com
						password: password
						password_confirmation: password
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details -> Copy the token




9) JWT mannual Middleware for better Exception handling
	[9.1] Mannual Middleware
		php artisan make:middleware JWT

		#Http->Middleware->JWT
			use Tymon\JWTAuth\Facades\JWTAuth;

			public function handle($request, Closure $next)
		    {
		        JWTAuth::parseToken()-> authenticate();
		        return $next($request);
		    }

		#Register this middleware in Kernel
			protected $routeMiddleware = [
		        ...
		        'JWT' => \App\Http\Middleware\JWT::class,
		    ];

	[9.2] Check and modify
		#Modify AuthController middleware (Just to check that it gives better error)
			public function __construct()
		    {
		        $this->middleware('JWT');
		    }

		#Use Postman to check
			#login
				Post: http://127.0.0.1:8000/api/auth/login
					Body:
						email: electa84@example.org (From MySQL TablePlus)
						password: password (From UserFactory)
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: 
					Message: The token could not be parsed from the request
					Exception: JWTException

				#Previous Output: (With 'api' middleware) 
					Message: Unauthenticated

				#It gives error rather than token becaue we are not using except in the middleware which is why all the routes are blocked.

		#Modify AuthController middleware to make login and signup work
			$this->middleware('JWT', ['except' => ['login', 'signup']]);

		#Use Postman to check
			#login
				Post: http://127.0.0.1:8000/api/auth/login
					Body:
						email: electa84@example.org (From MySQL TablePlus)
						password: password (From UserFactory)
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details

		#Use the middleware in all the controllers
			#QuestionController
				public function __construct()
			    {
					$this->middleware('JWT', ['except' => ['index', 'show']]);
			    }

				#Postman
					Post->http://127.0.0.1:8000/api/questions
					Header:
						Accept: application/json
						Content-Type: application/json
					Body:
						title: this is title
						slug: this-is-title
						body: loren ipsum
						category_id: 1
						user_id: 1

					#Output: 
						Message: The token could not be parsed from the request
						Exception: JWTException

				#Postman
					Get->http://127.0.0.1:8000/api/questions

					#Output: All the questions

			#ReplyController
				public function __construct()
			    {
					$this->middleware('JWT', ['except' => ['index', 'show']]);
			    }

			#CategoryController
				public function __construct()
			    {
					$this->middleware('JWT', ['except' => ['index', 'show']]);
			    }

			#LikeController
				public function __construct()
			    {
					$this->middleware('JWT');
			    }

	[9.3] Exception Handling
		#app->Exceptions->Handler.php
			use Tymon\JWTAuth\Exceptions\JWTException;

			public function render($request, Throwable $exception)
		    {
		        if($exception instanceof JWTException)
		        {
		            return response(['error'=>"Token is not provided"], 500);
		        }
		        return parent::render($request, $exception);
		    }

		#Use Postman to check
			#questions
				Post: http://127.0.0.1:8000/api/questions
					Body:
						name: Laravel 5.5.52
						body: Just checking using laravel
						user_id: 1
					Header:
						Accept: application/json
						Content-type: application/json

				#Output:  
					"error": "Token is not provided"

		#Make new exceptions: Token has been expired
			#login
				Post: http://127.0.0.1:8000/api/auth/login
					Body:
						email: electa84@example.org (From MySQL TablePlus)
						password: password (From UserFactory)
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details -> Copy the token

			#logout
				Post: http://127.0.0.1:8000/api/auth/logout (Details same as me)
					Authorization:
						Bearer Token: Paste the copied token 
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Successfully logged out

			#questions
				Post: http://127.0.0.1:8000/api/questions
					Authorization:
						Bearer Token: #Paste the same token
					Body:
						name: Laravel 5.5.52
						body: Just checking using laravel
						user_id: 1
					Header:
						Accept: application/json
						Content-type: application/json

				#Comment out the previous exception just to check the error
					public function render($request, Throwable $exception)
				    {
				        // if($exception instanceof JWTException)
				        // {
				        //     return response(['error'=>"Token is not provided"], 500);
				        // }

				        return parent::render($request, $exception);
				    }

				    #Output: 
						Message: The token has been blackliste
						Exception: TokenBlacklistedException

			#Edit the previous exception condition
				#app->Exceptions->Handler.php
				use Tymon\JWTAuth\Exceptions\JWTException;
				use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;

				public function render($request, Throwable $exception)
			    {
			        if($exception instanceof TokenBlacklistedException)
			        {
			            return response(['error'=>"Token has been expired"], 500);
			        }
			        else if($exception instanceof JWTException)
			        {
			            return response(['error'=>"Token is not provided"], 500);
			        }
			        
			        return parent::render($request, $exception);
			    }

			    #Use Postman to check
					#questions (with token)
						Post: http://127.0.0.1:8000/api/questions
							Authorization: 
								Bearer Token: #Paste the same token
							Body:
								name: Laravel 5.5.52
								body: Just checking using laravel
								user_id: 1
							Header:
								Accept: application/json
								Content-type: application/json

						#Output:  
							"error": "Token has been expired"

					#questions (without token)
						Post: http://127.0.0.1:8000/api/questions
							Authorization: 
								No Auth: 
							Body:
								name: Laravel 5.5.52
								body: Just checking using laravel
								user_id: 1
							Header:
								Accept: application/json
								Content-type: application/json

						#Output:  
							"error": "Token is not provided"

		#Make new exceptions: Token is invalid
			#questions
				Post: http://127.0.0.1:8000/api/questions
					Authorization:
						Bearer Token: #Change the token's values
					Body:
						name: Laravel 5.5.52
						body: Just checking using laravel
						user_id: 1
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: 
						#Output:  
							"error": "Token is not provided"

			#Comment out the previous exception just to check the error
				public function render($request, Throwable $exception)
			    {
			        // if($exception instanceof TokenBlacklistedException)
			        // {
			        //     return response(['error'=>"Token has been expired"], 500);
			        // }
			        // else if($exception instanceof JWTException)
			        // {
			        //     return response(['error'=>"Token is not provided"], 500);
			        // }

			        return parent::render($request, $exception);
			    }

			    #Output: 
					Message: Could not decode token
					Exception: TokenInvalidException

			#Edit the previous exception condition
				#app->Exceptions->Handler.php
					use Tymon\JWTAuth\Exceptions\JWTException;
					use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
					use Tymon\JWTAuth\Exceptions\TokenInvalidException;

					public function render($request, Throwable $exception)
				    {
				        
				        if($exception instanceof TokenBlacklistedException)
				        {
				            return response(['error'=>"Token has been expired"], 500);
				        }
				        else if($exception instanceof TokenInvalidException)
				        {
				            return response(['error'=>"Token is invalid"], 500);
				        }
				        else if($exception instanceof JWTException)
				        {
				            return response(['error'=>"Token is not provided"], 500);
				        }

				        return parent::render($request, $exception);
				    }

			    #Use Postman to check
					#questions (with token)
						Post: http://127.0.0.1:8000/api/questions
							Authorization: 
								Bearer Token: #Paste the same token
							Body:
								name: Laravel 5.5.52
								body: Just checking using laravel
								user_id: 1
							Header:
								Accept: application/json
								Content-type: application/json

						#Output:  
							"error": "Token has been expired"

					#questions (with edited token)
						Post: http://127.0.0.1:8000/api/questions
							Authorization: 
								Bearer Token: #Edit the original token
							Body:
								name: Laravel 5.5.52
								body: Just checking using laravel
								user_id: 1
							Header:
								Accept: application/json
								Content-type: application/json

						#Output:  
							"error": "Token is invalid"

					#questions (without token)
						Post: http://127.0.0.1:8000/api/questions
							Authorization: 
								No Auth: 
							Body:
								name: Laravel 5.5.52
								body: Just checking using laravel
								user_id: 1
							Header:
								Accept: application/json
								Content-type: application/json

						#Output:  
							"error": "Token is not provided"

		#Make new exceptions: Token is expired naturally
			#Edit the previous exception condition
				#app->Exceptions->Handler.php
					use Tymon\JWTAuth\Exceptions\JWTException;
					use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
					use Tymon\JWTAuth\Exceptions\TokenInvalidException;
					use Tymon\JWTAuth\Exceptions\TokenExpiredException;

					public function render($request, Throwable $exception)
				    {
				        
				        if($exception instanceof TokenBlacklistedException)
				        {
				            return response(['error'=>"Token has been expired"], 500);
				        }
				        else if($exception instanceof TokenInvalidException)
				        {
				            return response(['error'=>"Token is invalid"], 500);
				        }
				        else if($exception instanceof TokenExpiredException)
				        {
				            return response(['error'=>"Token has been expired"], 500);
				        }
				        else if($exception instanceof JWTException)
				        {
				            return response(['error'=>"Token is not provided"], 500);
				        }

				        return parent::render($request, $exception);
				    }

			#Use Postman to check
					#The token will expired naturally in 60 mins as per the JWT config file



10) Vue, Vuetify, Components and Vue-Router
	[10.1] Installation
		#Vue
			composer require laravel/ui

			php artisan ui vue

			npm install

			npm run dev

		#Vuetify
			npm install vuetify --save

		#resources->js->app.js
			require('./bootstrap');

			window.Vue = require('vue');

			import Vue from 'vue'
			import Vuetify from 'vuetify';
			Vue.use(Vuetify);

			Vue.component('home', require('./components/Home.vue').default);

			const app = new Vue({
			    el: '#app',
			    vuetify: new Vuetify(),
			});

		npm install @mdi/font -D

		#resources->sass->app.scss
			// Fonts
			@import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');
			@import url('https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css');

			// Vuetify
			@import '~vuetify/dist/vuetify.min.css';
			@import '~@mdi/font/css/materialdesignicons.min.css';

		#resources->views->home.blade.php (Create home.blade.php)
			<!DOCTYPE html>
			<html>
			    <head>
			        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
			        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
			    </head>

			    <body>
			        <div id="app">
			            <v-app>
			                Hello World
			            </v-app>
			        </div>
			        
			        <script src="{{ asset('js/app.js') }}" defer></script>   
			    </body>
			</html>


		#Add some component in it to make sure designing works
			<!DOCTYPE html>
			<html>
			    <head>
			        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
			        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
			    </head>

			    <body>
			        <div id="app">
			            <v-app>
			                <v-content>
			                    <template>
			                        <div class="text-center">
			                            <v-tooltip left>
			                            <template v-slot:activator="{ on }">
			                                <v-btn color="primary" dark v-on="on">Left</v-btn>
			                            </template>
			                            <span>Left tooltip</span>
			                            </v-tooltip>

			                            <v-tooltip top>
			                            <template v-slot:activator="{ on }">
			                                <v-btn color="primary" dark v-on="on">Top</v-btn>
			                            </template>
			                            <span>Top tooltip</span>
			                            </v-tooltip>

			                            <v-tooltip bottom>
			                            <template v-slot:activator="{ on }">
			                                <v-btn color="primary" dark v-on="on">Bottom</v-btn>
			                            </template>
			                            <span>Bottom tooltip</span>
			                            </v-tooltip>

			                            <v-tooltip right>
			                            <template v-slot:activator="{ on }">
			                                <v-btn color="primary" dark v-on="on">Right</v-btn>
			                            </template>
			                            <span>Right tooltip</span>
			                            </v-tooltip>
			                        </div>
			                    </template>
			                </v-content>
			            </v-app>
			        </div>
			        
			        <script src="{{ asset('js/app.js') }}" defer></script>   
			    </body>
			</html>

		#routes->web.php
			Route::get('/', function () {
			    return view('home');
			});

		npm run watch

		php artisan serve

	[10.2] Make the components
		#resources->components->Home.vue
			<template>
			    <div class="text-center">
			        #Copy any random component
			    </div>
			</template>

			<script>
			    export default {
			        
			    }
			</script>

			<style>

			</style>

		#resources->js->app.js
			Vue.component('home', require('./components/Home.vue').default);

		#resources->views->home.blade.php
			<!DOCTYPE html>
			<html>
			    <head>
			        <title>Forum SPA</title>
			        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
			        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
			    </head>

			    <body>
			        <div id="app">
			            <v-app>
			                <v-content>
			                    I'm home.blade.php file
			                    <home/>
			                </v-content>
			            </v-app>
			        </div>
			        
			        <script src="{{ asset('js/app.js') }}" defer></script>   
			    </body>
			</html>

	[10.3] Make Toolbar and AppFooter components
		#resources->components->Toolbar.vue
			<template>
			    #Random toolbar code
			</template>

			<script>
			    export default {
			        name: "Toolbar"
			    }
			</script>

			<style>

			</style>

		#resources->components->AppFooter.vue
			<template>
			    #Random footer code
			</template>

			<script>
			    export default {
			        name: "AppFooter"
			    }
			</script>

			<style>

			</style>


		#resources->components->Home.
			<template>
			    <div>
			        <Toolbar/>
			        <AppFooter/>
			    </div>
			</template>

			<script>
			    import Toolbar from'./Toolbar'
			    import AppFooter from'./AppFooter'

			    export default {
			        components: {Toolbar, AppFooter}
			    }
			</script>

			<style>

			</style>

		#No changes in resources->js->app.js

	[10.4] Add Vue-Router
		npm install vue-router

		#Make a new router file to define router
			#resources->router->router.js (Create new file and folder)
				import Vue from 'vue'
				import VueRouter from 'vue-router'
				import Login from'../components/login/Login'

				Vue.use(VueRouter)

				const routes = [
				    { path: '/login', component: Login }
				]

				const router = new VueRouter({
				    routes,
				    mode: 'history',
				    hash: false 
				})

				export default router

		#Check if the conponents are working
			#resources-> components->login->Login.vue (Create new folder & file)
					<template>
					    <h1>Hello I'm Login</h1>
					</template>

					<script>
					    export default {
					        name: "Login"
					    }
					</script>

					<style>

					</style>

			#resources->components->Home.vue
				<template>
				    <div>
				        <Toolbar />

				        <Login />

				        <br><br>
				        
				        <AppFooter />
				    </div>
				</template>

				<script>
				    import AppFooter from'./AppFooter'
				    import Login from'./login/Login'
				    import Toolbar from'./Toolbar'



				    export default {
				        name: "Home",

				        components: {
				            Toolbar, 
				            AppFooter,
				            Login
				        }
				    }
				</script>

				<style>

				</style>

			#resources->js->app.js
				require('./bootstrap');

				window.Vue = require('vue');

				import Vue from 'vue'
				import Vuetify from 'vuetify';
				import router from './router/router.js';

				Vue.use(Vuetify);

				Vue.component('home', require('./components/Home.vue').default);

				const app = new Vue({
				    el: '#app',
				    vuetify: new Vuetify(),
				    router
				});

			php artisan serve

			npm run watch

		#Make it work properly using <router-view>
			#resources->components->Home.vue
				<template>
				    <div>
				        <Toolbar />

				        <router-view/>

				        <br><br>
				        
				        <AppFooter />
				    </div>
				</template>

				<script>
				    import Toolbar from'./Toolbar'
				    import AppFooter from'./AppFooter'
				    import Login from'./login/Login'


				    export default {
				        components: {Toolbar, AppFooter, Login}
				    }
				</script>

				<style>

				</style>

			#resources->components->Toolbar.vue
				<template>
				    <v-card
				        flat
				        height="100px"
				        tile
				    >
				        <v-toolbar>
				            <v-toolbar-title>Forum SPA</v-toolbar-title>
					            <v-spacer></v-spacer>
					            <div>
					                <router-link to="/Forum">
					                    <v-btn depressed small>Forum</v-btn>
					                </router-link>
					                <router-link to="/category">
					                    <v-btn depressed small>Category</v-btn>
					                </router-link>
					                <router-link to="/askquestion">
					                    <v-btn depressed small>Ask Question</v-btn>
					                </router-link>
					                <router-link to="/login">
					                    <v-btn depressed small>Login</v-btn>
					                </router-link>
					            </div>
				        </v-toolbar>
				    </v-card>
				</template>

				<script>
				    export default {
				        
				    }
				</script>

				<style>

				</style>


11) Fix refresh button issue
	[11.1] Fix refresh button
		#Refresh won't work because router needs to be on the home page

		#routes->web.php
			Route::view('/', 'home');
			Route::view('/{any}', 'home');



12) Edit Login component
	[12.1] resources-> components->login->Login.vue
		<template>
		    <div>
		        <v-container>
		            <v-form @submit.prevent = "login">
		                <v-text-field
		                v-model="loginForm.email"
		                type="email"
		                label="E-mail"
		                required
		                ></v-text-field>

		                <v-text-field
		                v-model="loginForm.password"
		                type="password"
		                label="Password"
		                required
		                ></v-text-field>

		                <v-btn
		                color="success"
		                type="submit"
		                >
		                Login
		                </v-btn>
		            </v-form>
		        </v-container>
		    </div>
		</template>

		<script>
		    import axios from 'axios';

		    export default {

		        name: "Login",

		        data() {
		            return {
		                loginForm: {
		                    email: null,
		                    password: null
		                }
		            }
		        },

		        methods: {
		            login() {
		                axios.post('/api/auth/login', this.loginForm)
		                    .then(res => console.log(res.data))
		                    .catch(error => console.log(error.response.data))
		            }

		        }
		    }
		</script>

		<style>

		</style>

	[12.2] Go to the login page and enter the correct email and password
		#There will be access token in console log



13) JavaScript Helper class and functions
	[13.1] Move functions to a new file
		#resources->js->helpers->user.js (Create new folder and file)
			class User {
			    login(loginForm) {
			        axios.post('/api/auth/login', loginForm)
			            .then(res => console.log(res.data))
			            .catch(error => console.log(error.response.data))
			    }
			}

			export default User = new User();

		#resources->js->app.js
			require('./bootstrap');

			window.Vue = require('vue');

			import Vue from 'vue'
			import Vuetify from 'vuetify';
			import router from './router/router.js';
			import User from './helpers/user.js';
			window.User = User

			Vue.use(Vuetify);

			Vue.component('Home', require('./components/Home.vue').default);

			const app = new Vue({
			    el: '#app',
			    vuetify: new Vuetify(),
			    router
			});

		#resources->js->login->Login.vue
			<template>
			    <div>
			        <v-container>
			            <v-form @submit.prevent = "login">
			                <v-text-field
			                v-model="loginForm.email"
			                type="email"
			                label="E-mail"
			                required
			                ></v-text-field>

			                <v-text-field
			                v-model="loginForm.password"
			                type="password"
			                label="Password"
			                required
			                ></v-text-field>

			                <v-btn
			                color="success"
			                type="submit"
			                >
			                Login
			                </v-btn>
			            </v-form>
			        </v-container>
			    </div>
			</template>

			<script>
			    import axios from 'axios';

			    export default {

			        name: "Login",

			        data() {
			            return {
			                loginForm: {
			                    email: null,
			                    password: null
			                }
			            }
			        },

			        methods: {
			            login() {
			                User.login(this.loginForm)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#Check if you still get the access token

	[13.2] Store the token
		#resources->js->helpers->storage.js (Create new file)
			class Storage {
			    storeToken(token) {
			        localStorage.setItem('token', token)
			    }

			    storeUsername(username) {
			        localStorage.setItem('username', username)
			    }

			    store(token, username) {
			        this.storeToken(token)
			        this.storeUsername(username)
			    }
			    
			    clear() {
			        localStorage.removeItem('token')
			        localStorage.removeItem('username')
			    }

			    getToken() {
			        return localStorage.getItem('token')
			    }

			    getUsername() {
			        return localStorage.getItem('username')
			    }
			}

		export default Storage = new Storage();

		#As we are storing username with the token, AuthController:
			protected function respondWithToken($token)
		    {
		        return response()->json([
		            'access_token' => $token,
		            'token_type' => 'bearer',
		            'expires_in' => auth()->factory()->getTTL() * 60,
		            'user' => auth()->user()->name
		        ]);
		    }

	[13.3] Make sure the token is valid
		#A token has 3 parts: Header.Payload.Signature
			#Payload contains the real information of the token such as username

			#To get the payload, we need to split the token with '.'

		#resources->js->helpers->Token.js (Create new file)
			class Token {
			    isValid(token) {
			        const payload = this.getPayload(token)
			        if(payload) {
			            return payload.iss == "http://127.0.0.1:8000/api/auth/login" ? true :
			            false
			        }

			        return false
			    }

			    getPayload(token) {
			        const payload = token.split('.')[1]
			        return this.decode(payload)
			    }

			    decode(payload) {
			        return JSON.parse(atob(payload)) //Decode the token to make it look better
			    }
			}

			export default Token = new Token();

	[13.4] Finally validate and store the token
		#resources->js->helpers->user.js
			import Token from './token'
			import Storage from './storage'

			class User {
			    login(data) {
			        axios.post('/api/auth/login', data)
			            .then(res => this.responseAfterLogin(res))
			            .catch(error => console.log(error.response.data))
			    }

			    responseAfterLogin(res) {
			        const token = res.data.access_token
			        const username = res.data.user

			        if(Token.isValid(token))
			        {
			            console.log(token)
			            Storage.store(token, username)
			        }
			    }
			}

			export default User = new User();

		#Check console
			#It should display the token

		#Check application
			#It should store username and token

	[13.5] Login and Logout helpers
		#resources->helpers->user.js
			import Token from './token'
			import Storage from './storage'

			class User {
			    login(data) {
			        axios.post('/api/auth/login', data)
			            .then(res => this.responseAfterLogin(res))
			            .catch(error => console.log(error.response.data))
			    }

			    responseAfterLogin(res) {
			        const token = res.data.access_token
			        const username = res.data.user

			        if(Token.isValid(token))
			        {
			            console.log(token)
			            Storage.store(token, username)
			        }
			    }

			    hasToken() {
			        const storedToken = Storage.getToken()
			        if(storedToken){
			            return Token.isValid(storedToken) ? true : false
			        }

			        return false
			    }

			    loggedIn() {
			        return this.hasToken()
			    }

			    logout(){
			        Storage.clear()
			    }

			    name() {
			        if(this.loggedIn()){
			            return Storage.getUsername()
			        }
			    }

			    id() { //id is the sub: part of the payload
			        if(this.loggedIn()){
			            const payload = Token.getPayload(Storage.getToken())
			            return payload.sub
			        }
			    }

			    own(id) {
			        return this.id() == id
			    }
			}

			export default User = new User();



14) Authentication, Signup and Logout
	[14.1] Create Signup Component
		#resources->js->components->login->Signup.Vue (Create a new file)
			<template>
			    <div>
			        <v-container>
			            <v-form @submit.prevent = "signup">
			                <v-text-field
			                v-model="signupForm.name"
			                type="text"
			                label="Name"
			                required
			                ></v-text-field>

			                <v-text-field
			                v-model="signupForm.email"
			                type="email"
			                label="E-mail"
			                required
			                ></v-text-field>

			                <v-text-field
			                v-model="signupForm.password"
			                type="password"
			                label="Password"
			                required
			                ></v-text-field>

			                <v-text-field
			                v-model="signupForm.password_confirmation"
			                type="password"
			                label="Confirm Password"
			                required
			                ></v-text-field>

			                <v-btn
			                color="success"
			                type="submit"
			                >
			                Signup
			                </v-btn>

			                <router-link to="/login">
			                    <v-btn color="blue">Login</v-btn>
			                </router-link>
			            </v-form>
			        </v-container>
			    </div>
			</template>

			<script>
			    import axios from 'axios';

			    export default {

			        name: "Signup",

			        data() {
			            return {
			                signupForm: {
			                    name: null,
			                    email: null,
			                    password: null,
			                    password_confirmation: null
			                }
			            }
			        },

			        methods: {
			            signup() {
			                axios.post('api/auth/signup', this.signupForm)
			                    .then(res => User.responseAfterLogin(res))
			                    .catch(error => console.log(error.response.data))
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->login->Signup.Vue (Add signup router link)
			<template>
			    <div>
			        <v-container>
			            <v-form @submit.prevent = "login">
			                <v-text-field
			                v-model="loginForm.email"
			                type="email"
			                label="E-mail"
			                required
			                ></v-text-field>

			                <v-text-field
			                v-model="loginForm.password"
			                type="password"
			                label="Password"
			                required
			                ></v-text-field>

			                <v-btn
			                color="success"
			                type="submit"
			                >
			                Login
			                </v-btn>

			                <router-link to="/signup">
			                    <v-btn color="blue">Signup</v-btn>
			                </router-link>
			            </v-form>
			        </v-container>
			    </div>
			</template>

			<script>
			    import axios from 'axios';

			    export default {

			        name: "Login",

			        data() {
			            return {
			                loginForm: {
			                    email: null,
			                    password: null
			                }
			            }
			        },

			        methods: {
			            login() {
			                User.login(this.loginForm)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->router->router.js (Register the router)
			import Vue from 'vue'
			import VueRouter from 'vue-router'

			import Login from'../components/login/Login'
			import Signup from'../components/login/Signup'

			Vue.use(VueRouter)

			const routes = [
			    { path: '/login', component: Login },
			    { path: '/signup', component: Signup }
			]

			const router = new VueRouter({
			    routes,
			    mode: 'history',
			    hash: false
			})

			export default router

	[14.2] Signup Validation
		php artisan make:request SignupRequest

		#Edit SignupRequest validation in the backend
			#app->Http->Requests->SignupRequest
				public function authorize()
			    {
			        return true;
			    }

			    public function rules()
			    {
			        return [
			            'name' => 'required',
			            'email' => 'required',
			            'password' => 'required|confirmed'
			        ];
			    }

			#app->Http->Controllers->AuthController
				use App\Http\Requests\SignupRequest;

				public function signup(SignupRequest $request)
			    {
			        User::create($request->all());
			        return $this->login($request);
			    }

			#Signup the empty form and check console. errors: name/email... requried

		#Store errors in an object and display it on the form
			#resources->js->components->login->Signup.Vue (Display it errors)
			<template>
			    <div>
			        <v-container>
			            <v-form @submit.prevent = "signup">
			                <v-text-field
			                v-model="signupForm.name"
			                type="text"
			                label="Name"
			                required
			                ></v-text-field>
			                <span class="red--text" v-if="errors.name">{{errors.name[0]}}</span>

			                <v-text-field
			                v-model="signupForm.email"
			                type="email"
			                label="E-mail"
			                required
			                ></v-text-field>
			                <span class="red--text" v-if="errors.email">{{errors.email[0]}}</span>

			                <v-text-field
			                v-model="signupForm.password"
			                type="password"
			                label="Password"
			                required
			                ></v-text-field>
			                <span class="red--text" v-if="errors.password">{{errors.password[0]}}</span>

			                <v-text-field
			                v-model="signupForm.password_confirmation"
			                type="password"
			                label="Confirm Password"
			                required
			                ></v-text-field>

			                <v-btn
			                color="success"
			                type="submit"
			                >
			                Signup
			                </v-btn>

			                <router-link to="/login">
			                    <v-btn color="blue">Login</v-btn>
			                </router-link>
			            </v-form>
			        </v-container>
			    </div>
			</template>

			<script>
			    import axios from 'axios';

			    export default {

			        name: "Signup",

			        data() {
			            return {
			                signupForm: {
			                    name: null,
			                    email: null,
			                    password: null,
			                    password_confirmation: null
			                },
			                errors:{}
			            }
			        },

			        methods: {
			            signup() {
			                axios.post('api/auth/signup', this.signupForm)
			                    .then(res => User.responseAfterLogin(res))
			                    .catch(error => this.errors = error.response.data.errors)
			            }
			        }
			    }
			</script>

			<style>

			</style>

			#Check the stored errors{} in dev tool

			#Enter empty fields and check the span error messages

	[14.3] User is logged in automatically once automatically registered
		#Make changes in signup function
			#resources->js->components->login->Signup.Vue (Similar to Login)
				<template>
				    <div>
				        <v-container>
				            <v-form @submit.prevent = "signup">
				                <v-text-field
				                v-model="signupForm.name"
				                type="text"
				                label="Name"
				                required
				                ></v-text-field>
				                <span class="red--text" v-if="errors.name">{{errors.name[0]}}</span>

				                <v-text-field
				                v-model="signupForm.email"
				                type="email"
				                label="E-mail"
				                required
				                ></v-text-field>
				                <span class="red--text" v-if="errors.email">{{errors.email[0]}}</span>

				                <v-text-field
				                v-model="signupForm.password"
				                type="password"
				                label="Password"
				                required
				                ></v-text-field>
				                <span class="red--text" v-if="errors.password">{{errors.password[0]}}</span>

				                <v-text-field
				                v-model="signupForm.password_confirmation"
				                type="password"
				                label="Confirm Password"
				                required
				                ></v-text-field>

				                <v-btn
				                color="success"
				                type="submit"
				                >
				                Signup
				                </v-btn>

				                <router-link to="/login">
				                    <v-btn color="blue">Login</v-btn>
				                </router-link>
				            </v-form>
				        </v-container>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {

				        name: "Signup",

				        data() {
				            return {
				                signupForm: {
				                    name: null,
				                    email: null,
				                    password: null,
				                    password_confirmation: null
				                },
				                errors:{},
				            }
				        },

				        methods: {
				            signup() {
				                User.signup(this.signupForm)
				            }
				        }
				    }
				</script>

				<style>

				</style>

		#Store the signup function in user.js
			#resources->js->helpers->user.js 
				import Token from './token'
				import Storage from './storage'

				class User {
				    login(data) {
				        axios.post('/api/auth/login', data)
				            .then(res => this.responseAfterLogin(res))
				            .catch(error => console.log(error.response.data))
				    }

				    signup(data) {
				        axios.post('/api/auth/signup', data)
				            .then(res => this.responseAfterLogin(res))
				            .catch(error => this.errors = error.response.data.errors)
				    }

				    responseAfterLogin(res) {
				        const token = res.data.access_token
				        const username = res.data.user

				        if(Token.isValid(token))
				        {
				            console.log(token)
				            Storage.store(token, username)
				        }
				    }

				    hasToken() {
				        const storedToken = Storage.getToken()
				        if(storedToken){
				            return Token.isValid(storedToken) ? true : false
				        }

				        return false
				    }

				    loggedIn() {
				        return this.hasToken()
				    }

				    logout(){
				        Storage.clear()
				    }

				    name() {
				        if(this.loggedIn()){
				            return Storage.getUsername()
				        }
				    }

				    id() { //id is the sub: part of the payload
				        if(this.loggedIn()){
				            const payload = Token.getPayload(Storage.getToken())
				            return payload.sub
				        }
				    }

				    own(id) {
				        return this.id() == id
				    }
				}

				export default User = new User();

		#Modify payload.iss
			#resources->js->helpers->token.js 
				class Token {
				    isValid(token) {
				        const payload = this.getPayload(token)
				        if(payload) {
				            return payload.iss == "http://127.0.0.1:8000/api/auth/login" || "http://127.0.0.1:8000/api/auth/signup" ? true :
				            false
				        }

				        return false
				    }

				    getPayload(token) {
				        const payload = token.split('.')[1]
				        return this.decode(payload)
				    }

				    decode(payload) {
				        return JSON.parse(atob(payload)) //Decode the token to make it look better
				    }
				}

				export default Token = new Token();

		#Check if user is logged in in console with loggedin()
			#resources->js->app.js
				require('./bootstrap');

				window.Vue = require('vue');

				import Vue from 'vue'
				import Vuetify from 'vuetify';
				import router from './router/router.js';
				import User from './helpers/user.js';
				window.User = User

				console.log(User.loggedIn())

				Vue.use(Vuetify);

				Vue.component('Home', require('./components/Home.vue').default);

				const app = new Vue({
				    el: '#app',
				    vuetify: new Vuetify(),
				    router
				});

			#Console log -> Application to clear up the tokens

	[14.4] Redirect after login
		#Make new Forum component
			#resources->js->components->forum->Forum.vue
				<template>
				    <div>
				        <h1>Hello</h1>
				    </div>
				</template>

				<script>
				    export default {
				        name: "Forum"
				    }
				</script>

				<style>

				</style>

		#Add routes to the Forum component
			#resources->js->router->router.js
				import Vue from 'vue'
				import VueRouter from 'vue-router'

				import Login from'../components/login/Login'
				import Signup from'../components/login/Signup'
				import Forum from'../components/forum/Forum'


				Vue.use(VueRouter)

				const routes = [
				    { path: '/login', component: Login },
				    { path: '/signup', component: Signup },
    				{ path: '/forum', component: Forum, name:"Forum" }
				]

				const router = new VueRouter({
				    routes,
				    mode: 'history',
				    hash: false
				})

				export default router


		#Add $router.push in the login/signup functions
			#resources->js->components->login->Login.Vue
				methods: {
		            login() {
		                User.login(this.loginForm)
		                this.$router.push({name: 'Forum'})
		            }
		        }

			resources->js->components->login->Login.Vue
		        methods: {
		            signup() {
		                User.signup(this.signupForm)
		                this.$router.push({name: 'Forum'})
		            }
		        }

		#Login/Register to make sure you are redirected to forum

	[14.5] Disable login/logout routes/buttons once logged in/logged out
		#Hide the buttons which are not requried
			#resources->js->components->Toolbar.vue
				<template>
				    <v-card
				        flat
				        height="100px"
				        tile
				    >
				        <v-toolbar>
				            <v-toolbar-title>Forum SPA</v-toolbar-title>
				            <v-spacer></v-spacer>
				            <div>
				                <router-link v-for="item in items" :key="item.title" :to="item.to" v-if="item.show">
				                    <v-btn depressed small>{{item.title}}</v-btn>
				                </router-link>
				            </div>
				        </v-toolbar>
				    </v-card>
				</template>

				<script>
				    export default {
				        name: "Toolbar",

				        data(){
				            return {
				                items: [
				                    {title: 'Forum', to: '/forum', show: true},
				                    {title: 'Ask Questionn', to: '/askquestion', show: User.loggedIn()},
				                    {title: 'Category', to: '/category', show: User.loggedIn()},
				                    {title: 'Login', to: '/login', show: !User.loggedIn()},
				                    {title: 'Logout', to: '/logout', show: User.loggedIn()},             
				                ]
				            }
				        }
				    }
				</script>

				<style>

				</style>

			#Check by loggingin or deleting the token from Application 

		#Disable the login/signup routes once logged in with created()
			#resources->js->components->login->Login.vue
				<script>
				    import axios from 'axios';

				    export default {

				        name: "Login",

				        data() {
				            return {
				                loginForm: {
				                    email: null,
				                    password: null
				                }
				            }
				        },

				        created(){
				            if(User.loggedIn())
				            {
				                this.$router.push({name: 'Forum'})
				            }
				        },

				        methods: {
				            login() {
				                User.login(this.loginForm)
				                this.$router.push({name: 'Forum'})
				            }
				        }
				    }
				</script>

			#resources->js->components->login->Signup.vue
				<script>
				    import axios from 'axios';

				    export default {

				        name: "Signup",

				        data() {
				            return {
				                signupForm: {
				                    name: null,
				                    email: null,
				                    password: null,
				                    password_confirmation: null
				                },
				                errors:{},
				            }
				        },

				        created(){
				            if(User.loggedIn())
				            {
				                this.$router.push({name: 'Forum'})
				            }
				        },

				        methods: {
				            signup() {
				                User.signup(this.signupForm)
				                this.$router.push({name: 'Forum'})
				            }
				        }
				    }
				</script>

			#Check by entering te signup/login route mannually once logged in

	[14.6] Make logout work
		#Make new Forum component
			#resources->js->components->login->Logout.vue
				<script>
				    export default {
				        name: "Logout",

				        created(){
				            EventBus.$emit('logout')
				        }
				    }
				</script>

		#Create new Vue window for EventBus 
			#resources->js->app.
				require('./bootstrap');

				window.Vue = require('vue');

				import Vue from 'vue'
				import Vuetify from 'vuetify';
				import router from './router/router.js';
				import User from './helpers/user.js';
				window.User = User

				console.log(User.loggedIn())

				window.EventBus = new Vue();

				Vue.use(Vuetify);

				Vue.component('Home', require('./components/Home.vue').default);

				const app = new Vue({
				    el: '#app',
				    vuetify: new Vuetify(),
				    router
				});

		#Listen the EventBus in Toolbar component 
			#resources->js->components->Toolbar.vue
				<script>
				    export default {
				        name: "Toolbar",

				        created() {
				            EventBus.$on('logout', () => {
				                User.logout()
				            })
				        },

				        data(){
				            return {
				                items: [
				                    {title: 'Forum', to: '/forum', show: true},
				                    {title: 'Ask Questionn', to: '/askquestion', show: User.loggedIn()},
				                    {title: 'Category', to: '/category', show: User.loggedIn()},
				                    {title: 'Login', to: '/login', show: !User.loggedIn()},
				                    {title: 'Logout', to: '/logout', show: User.loggedIn()},             
				                ]
				            }
				        }
				    }
				</script>

		#Make the logout route in router
			#resources->js->router->router.js
				import Vue from 'vue'
				import VueRouter from 'vue-router'

				import Login from'../components/login/Login'
				import Logout from'../components/login/Logout'
				import Signup from'../components/login/Signup'
				import Forum from'../components/forum/Forum'


				Vue.use(VueRouter)

				const routes = [
				    { path: '/login', component: Login },
				    { path: '/logout', component: Logout },
				    { path: '/signup', component: Signup },
				    { path: '/forum', component: Forum, name:"Forum" }
				]

				const router = new VueRouter({
				    routes,
				    mode: 'history',
				    hash: false
				})

				export default router

		#Add window.location to refersh once logged in/logged out to display the appropriate buttons
			#resources->js->helpers->user.js
				import Token from './token'
				import Storage from './storage'

				class User {
				    login(data) {
				        axios.post('/api/auth/login', data)
				            .then(res => this.responseAfterLogin(res))
				            .catch(error => console.log(error.response.data))
				    }

				    signup(data) {
				        axios.post('/api/auth/signup', data)
				            .then(res => this.responseAfterLogin(res))
				            .catch(error => this.errors = error.response.data.errors)
				    }

				    responseAfterLogin(res) {
				        const token = res.data.access_token
				        const username = res.data.user

				        if(Token.isValid(token))
				        {
				            console.log(token)
				            Storage.store(token, username)
				            window.location = "/forum"
				        }
				    }

				    hasToken() {
				        const storedToken = Storage.getToken()
				        if(storedToken){
				            return Token.isValid(storedToken) ? true : false
				        }

				        return false
				    }

				    loggedIn() {
				        return this.hasToken()
				    }

				    logout(){
				        Storage.clear()
				        window.location = "/forum"
				    }

				    name() {
				        if(this.loggedIn()){
				            return Storage.getUsername()
				        }
				    }

				    id() { //id is the sub: part of the payload
				        if(this.loggedIn()){
				            const payload = Token.getPayload(Storage.getToken())
				            return payload.sub
				        }
				    }

				    own(id) {
				        return this.id() == id
				    }
				}

				export default User = new User();

		#To avoid double refresh, remove router.push from the methods
			#resources->js->components->Login.Vue
				<template>
				    <div>
				        <v-container>
				            <v-form @submit.prevent = "login">
				                <v-text-field
				                v-model="loginForm.email"
				                type="email"
				                label="E-mail"
				                required
				                ></v-text-field>

				                <v-text-field
				                v-model="loginForm.password"
				                type="password"
				                label="Password"
				                required
				                ></v-text-field>

				                <v-btn
				                color="success"
				                type="submit"
				                >
				                Login
				                </v-btn>

				                <router-link to="/signup">
				                    <v-btn color="blue">Signup</v-btn>
				                </router-link>
				            </v-form>
				        </v-container>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {

				        name: "Login",

				        data() {
				            return {
				                loginForm: {
				                    email: null,
				                    password: null
				                }
				            }
				        },

				        created(){
				            if(User.loggedIn())
				            {
				                this.$router.push({name: 'Forum'})
				            }
				        },

				        methods: {
				            login() {
				                User.login(this.loginForm)
				            }
				        }
				    }
				</script>

				<style>

				</style>

			#resources->js->components->Signup.Vue
				<template>
				    <div>
				        <v-container>
				            <v-form @submit.prevent = "signup">
				                <v-text-field
				                v-model="signupForm.name"
				                type="text"
				                label="Name"
				                required
				                ></v-text-field>
				                <span class="red--text" v-if="errors.name">{{errors.name[0]}}</span>

				                <v-text-field
				                v-model="signupForm.email"
				                type="email"
				                label="E-mail"
				                required
				                ></v-text-field>
				                <span class="red--text" v-if="errors.email">{{errors.email[0]}}</span>

				                <v-text-field
				                v-model="signupForm.password"
				                type="password"
				                label="Password"
				                required
				                ></v-text-field>
				                <span class="red--text" v-if="errors.password">{{errors.password[0]}}</span>

				                <v-text-field
				                v-model="signupForm.password_confirmation"
				                type="password"
				                label="Confirm Password"
				                required
				                ></v-text-field>

				                <v-btn
				                color="success"
				                type="submit"
				                >
				                Signup
				                </v-btn>

				                <router-link to="/login">
				                    <v-btn color="blue">Login</v-btn>
				                </router-link>
				            </v-form>
				        </v-container>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {

				        name: "Signup",

				        data() {
				            return {
				                signupForm: {
				                    name: null,
				                    email: null,
				                    password: null,
				                    password_confirmation: null
				                },
				                errors:{},
				            }
				        },

				        created(){
				            if(User.loggedIn())
				            {
				                this.$router.push({name: 'Forum'})
				            }
				        },

				        methods: {
				            signup() {
				                User.signup(this.signupForm)
				            }
				        }
				    }
				</script>

				<style>

				</style>

15) Frontend Questions CRUD
	[15.1] Fetch and display the questions
		#resources->js->components->forum->Forum.
			<template>
			    <v-container fluid grid-list-md>
			        <v-layout row wrap>
			            <v-flex xs8>
			                <Question v-for="question in questions" :key="question.path" :question=question>
			                        
			                </Question>
			            </v-flex>
			                Sidebar
			        </v-layout>
			    </v-container>
			</template>

			<script>
			    import Questions from "./Questions"

			    export default {
			        name: "Forum",

			        components: {Questions},

			        data() {
			            return {
			                questions: {}
			            }
			        },

			        created(){
			            axios.get('api/questions')
			                .then(res => this.questions = res.data.data)
			                .catch(error => console.log(error.response.data))
			        }
			    }
			</script>

			<style>

			</style>


		#resources->js->components->forum->Question.Vue
			<template>
			    <v-card
			        class="mx-auto mb-5"
			        max-width="700"
			        outlined
			    >
			        <v-list-item three-line>
			            <v-list-item-content>
			                <v-list-item-title class="headline mb-1">
			                    <router-link :to="question.path"> 
			                        {{question.title}}
			                    </router-link>
			                </v-list-item-title>
			                <v-list-item-title class=" mb-5 mt-4">{{question.body}}</v-list-item-title>
			                <v-list-item-subtitle>{{question.created_at}}</v-list-item-subtitle>
			            </v-list-item-content>
			        </v-list-item>

			        <v-card-text>
			            <v-btn text>Like</v-btn>
			            <v-btn text>Dislike</v-btn>
			        </v-card-text>
			  </v-card>
			</template>

			<script>
			    export default {
			        name: "Questions",

			        props:['question'],
			    }
			</script>

			<style>

			</style>


		#Question Model (Change the display of path)
			#app->HTTP->Model->Question
				public function getPathAttribute()
			    {
			        return "api/questions/$this->slug";
			    }

	[15.2] Select single question
		#Change the display of path again to get rid of api
			#app->HTTP->Model->Question
				public function getPathAttribute()
			    {
			        return "/questions/$this->slug";
			    }

		#Create new component SingleQuestion.vue
			#resources->js->components->SingleQuestion.vue
				<template>
				    <div>
				        Hello World<!-- <ShowQuestion :question = question></ShowQuestion> -->
				    </div>
				</template>

				<script>

				    export default {
				        name: "SingleQuestion",

				        data(){
				            return {
				                question:{}
				            }
				        },

				        created(){
				            axios.get(`/api/questions/${this.$route.params.slug}`)
				            //console.log(`${this.$route.params.slug}`)
				                .then(res => this.question = res.data.data)
				                .catch(error => console.log(error.response.data))
				        }

				    }
				</script>

				<style>

				</style>

		#Define that route and component in router
			#resources->js->router->router.js
				import Vue from 'vue'
				import VueRouter from 'vue-router'

				import Login from'../components/login/Login'
				import Logout from'../components/login/Logout'
				import Signup from'../components/login/Signup'
				import Forum from'../components/forum/Forum'
				import SingleQuestion from'../components/forum/SingleQuestion'

				Vue.use(VueRouter)

				const routes = [
				    { path: '/login', component: Login },
				    { path: '/logout', component: Logout },
				    { path: '/signup', component: Signup },
				    { path: '/forum', component: Forum, name:"Forum" },
				    { path: '/questions/:slug', component: SingleQuestion, name:"SingleQuestion" }
				]

				const router = new VueRouter({
				    routes,
				    mode: 'history',
				    hash: false
				})

				export default router

		#Fix refresh as it wont work due to 3 sections in the link
			#routes->web.php
				Route::view('/', 'home');
				Route::view('/{any}', 'home');
				Route::view('/{any}/{any1}', 'home');

		#Check by clicking in on the question->inspact
			#Network->Name->Select the selected question slug->Preview
				#It should display question details

	[15.3] Display single question
		#Make changes in the SingleQuestion and pass the prop
			#resources->js->components->forum->SingleQuestion.vue
				<template>
				    <div>
				        <ShowQuestion :question = question></ShowQuestion>
				    </div>
				</template>

				<script>
				    import ShowQuestion from "./ShowQuestion"

				    export default {
				        name: "SingleQuestion",

				        components: {ShowQuestion},

				        data(){
				            return {
				                question:{}
				            }
				        },

				        created(){
				            axios.get(`/api/questions/${this.$route.params.slug}`)
				                .then(res => this.question = res.data.data)
				                .catch(error => console.log(error.response.data))
				        }

				    }
				</script>

				<style>

				</style>

		#Create new component ShowQuestion.vue
			#resources->js->components->forum->ShowQuestion.vue
				<template>
				    <v-card
				        class="mx-auto mb-5"
				        max-width="700"
				        outlined
				    >
				        <v-list-item three-line>
				            <v-list-item-content>
				                <v-list-item-title class="headline mb-1">{{question.title}}</v-list-item-title>
				                <v-list-item-title class=" mb-5 mt-4">{{question.body}}</v-list-item-title>
				                <v-list-item-subtitle>{{question.user}} : {{question.created_at}}</v-list-item-subtitle>
				            </v-list-item-content>
				        </v-list-item>

				        <v-card-text>
				            <v-btn text>Like</v-btn>
				            <v-btn text>Dislike</v-btn>
				        </v-card-text>
				        <v-spacer></v-spacer>
				        <v-btn color="green" class="ml-5 mb-5">5 Replies</v-btn>
				    </v-card>
				</template>

				<script>
				    export default {
				        props:['question']
				    }
				</script>

				<style>

				</style>

	[15.3] Ask a new question
		#resources->js->router->router.js
			import Vue from 'vue'
			import VueRouter from 'vue-router'

			import Login from'../components/login/Login'
			import Logout from'../components/login/Logout'
			import Signup from'../components/login/Signup'
			import Forum from'../components/forum/Forum'
			import SingleQuestion from'../components/forum/SingleQuestion'
			import AskQuestion from'../components/forum/AskQuestion'


			Vue.use(VueRouter)

			const routes = [
			    { path: '/login', component: Login },
			    { path: '/logout', component: Logout },
			    { path: '/signup', component: Signup },
			    { path: '/forum', component: Forum, name:"Forum" },
			    { path: '/questions/:slug', component: SingleQuestion, name:"SingleQuestion" },
			    { path: '/askquestion', component: AskQuestion }
			]

			const router = new VueRouter({
			    routes,
			    mode: 'history',
			    hash: false
			})

			export default router

		#Install Markdown and add icons
			npm install vue-simplemde --save

			npm install --save material-design-icons-iconfont


			#resources->js->app.js
				require('./bootstrap');

				window.Vue = require('vue');

				import Vue from 'vue'
				import Vuetify from 'vuetify';
				import router from './router/router.js';
				import User from './helpers/user.js';
				window.User = User

				console.log(User.loggedIn())

				window.EventBus = new Vue();

				Vue.use(Vuetify);

				//add this
				import VueSimplemde from 'vue-simplemde' 
				import 'simplemde/dist/simplemde.min.css'

				Vue.component('vue-simplemde', VueSimplemde)
				//

				Vue.component('Home', require('./components/Home.vue').default);

				const app = new Vue({
				    el: '#app',
				    vuetify: new Vuetify(),
				    router
				});

			#resources->sass->app.scss
				npm install --save material-design-icons-iconfont

				// Fonts
				@import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');
				@import url('https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css');

				// Vuetify
				@import '~vuetify/dist/vuetify.min.css';
				@import '~@mdi/font/css/materialdesignicons.min.css';
				@import '~material-design-icons-iconfont/dist/material-design-icons.css';

				//MDE
				@import '~simplemde/dist/simplemde.min.css';

		#Pass the token
			#resources->sass->bootstrap.js
				window.axios = require('axios');

				window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

				const JwtToken = `Bearer ${localStorage.getItem('token')}`
				window.axios.defaults.headers.common['Authorization'] = JwtToken;

		#Store question with user_id and slug and redirect to the question
			#app->Http->Controllers->QuestionController
				use Illuminate\Support\Str;

			        public function store(Request $request)
				    {
				        $request['slug'] = Str::slug($request->title);
				        $question = auth()->user()->questions()->create($request->all()); 
				         
				        return response(new QuestionResource($question), 201);
				    }

		#Create new component AskQuestion.vue
			#resources->js->components->forum->AskQuestion.vue
				<template>
				    <v-container>
				        <v-form @submit.prevent = "askQuestion">
				            <v-text-field
				            v-model="questionForm.title"
				            type="text"
				            label="Title"
				            required
				            ></v-text-field>

				            <v-select
				                :items="categories"
				                item-text="name"
				                item-value="id"
				                v-model="questionForm.category_id"
				                label="Category"
				                autocomplete
				            ></v-select>

				            <vue-simplemde v-model="questionForm.body" ref="markdownEditor" />

				            <br><br><br>

				            <v-btn
				                color="success"
				                type="submit"
				                >
				                Create
				            </v-btn>
				        </v-form>
				    </v-container>
				</template>

				<script>
				    export default {
				        name: "AskQuestion",

				        data(){
				            return {
				                questionForm: {
				                    title: null,
				                    body: null,
				                    category_id: null
				                },
				                categories: {},
				                errors: {}
				            }
				        },

				        created() {
				            axios.get('/api/categories')
				                .then(res => this.categories = res.data.data)
				        },

				        methods:{
				            askQuestion() {
				                axios.post('/api/questions', this.questionForm)
				                    .then(res => this.$router.push(res.data.path))
				                    .catch(error => this.errors = error.response.data.error)
				            }
				        }

				    }
				</script>

				<style>

				</style>

		#Avoid parse() errors by adding v-if and setting question to null:
			#resources->js->components->forum->SingleQuestion.vue
				<template>
				    <div>
				        <ShowQuestion :question = question v-if="question"></ShowQuestion>
				    </div>
				</template>

				<script>
				    import ShowQuestion from "./ShowQuestion"

				    export default {
				        name: "SingleQuestion",

				        components: {ShowQuestion},

				        data(){
				            return {
				                question: null
				            }
				        },

				        created(){
				            axios.get(`/api/questions/${this.$route.params.slug}`)
				            //console.log(`${this.$route.params.slug}`)
				                .then(res => this.question = res.data.data)
				                .catch(error => console.log(error.response.data))
				        }

				    }
				</script>

				<style>

				</style>

		#Convert markdown to html and show icons only if user is authenticated
			#resources->js->components->forum->ShowQuestion.vue
				<template>
				    <v-card
				        class="mx-auto mb-5"
				        max-width="700"
				        outlined
				    >
				        <v-list-item three-line>
				            <v-list-item-content>
				                <v-list-item-title class="headline mb-1">{{question.title}}</v-list-item-title>
				                <v-card-text class=" mb-5 mt-4"  v-html="body"></v-card-text>
				                <v-list-item-subtitle>{{question.user}} : {{question.created_at}}</v-list-item-subtitle>
				            </v-list-item-content>
				        </v-list-item>

				        <v-card-actions class="ml-5" v-if="own">
				            <v-btn icon small class="mb-5">
				                <v-icon color="green" >edit</v-icon>
				            </v-btn>
				            <v-btn icon small class="ml-5 mb-5">
				                <v-icon color="red">delete</v-icon>
				            </v-btn>
				        </v-card-actions>

				        <v-spacer></v-spacer>
				        <v-spacer></v-spacer>

				        <v-btn color="green" class="ml-5 mb-5">5 Replies</v-btn>
				    </v-card>
				</template>

				<script>
				    import md from 'marked'

				    export default {
				        props:['question'],

				        data() {
				            return {
				                own : User.own(this.question.id)
				            }
				        },

				        computed: {
				            body() {
				                return md.parse(this.question.body)
				            }
				        }
				    }
				</script>

				<style>
				    
				</style>

	[15.4] Delete Question
		#resources->js->components->forum->ShowQuestion.vue
			<template>
			    <v-card
			        class="mx-auto mb-5"
			        max-width="700"
			        outlined
			    >
			        <v-list-item three-line>
			            <v-list-item-content>
			                <v-list-item-title class="headline mb-1">{{question.title}}</v-list-item-title>
			                <v-card-text class=" mb-5 mt-4"  v-html="body"></v-card-text>
			                <v-list-item-subtitle>{{question.user}} : {{question.created_at}}</v-list-item-subtitle>
			            </v-list-item-content>
			        </v-list-item>

			        <v-card-actions class="ml-5" v-if="own">
			            <v-btn icon small class="mb-5">
			                <v-icon color="green" >edit</v-icon>
			            </v-btn>
			            <v-btn icon small class="ml-5 mb-5" @click="deleteQuestion">
			                <v-icon color="red">delete</v-icon>
			            </v-btn>
			        </v-card-actions>

			        <v-spacer></v-spacer>
			        <v-spacer></v-spacer>

			        <v-btn color="green" class="ml-5 mb-5">5 Replies</v-btn>
			    </v-card>
			</template>

			<script>
			    import md from 'marked'

			    export default {
			        props:['question'],

			        data() {
			            return {
			                own : User.own(this.question.id)
			            }
			        },

			        computed: {
			            body() {
			                return md.parse(this.question.body)
			            }
			        },

			        methods: {
			            deleteQuestion() {
			                axios.delete(`/api/questions/${this.$route.params.slug}`)
			                    .then(res => this.$router.push('/forum'))
			                    .catch(error => console.log(error))
			            }

			            	#OR

			            #app->Http->Resources->QuestionResource
			            	public function toArray($request)
						    {
						        return [
						            'title' => $this->title,
						            'slug' => $this->slug,
						            'path' => $this->path,
						            'body' => $this->body,
						            'created_at' => $this->created_at->diffForHumans(),
						            'user' => $this->user->name,
						            'id' => $this->user_id
						        ];
						    }

						deleteQuestion() {
			                axios.delete(`/api/questions/${this.question.slug}`)
			                    .then(res => this.$router.push('/forum'))
			                    .catch(error => console.log(error))
			            }


			        }
			    }
			</script>

			<style>
			    
			</style>

	[15.5] Edit Question
		#resources->js->components->forum->ShowQuestion.vue
			<template>
			    <v-card
			        class="mx-auto mb-5"
			        max-width="700"
			        outlined
			    >
			        <v-list-item three-line>
			            <v-list-item-content>
			                <v-list-item-title class="headline mb-1">{{question.title}}</v-list-item-title>
			                <v-card-text class=" mb-5 mt-4"  v-html="body"></v-card-text>
			                <v-list-item-subtitle>{{question.user}} : {{question.created_at}}</v-list-item-subtitle>
			            </v-list-item-content>
			        </v-list-item>

			        <v-card-actions class="ml-5" v-if="own">
			            <v-btn icon small class="mb-5" @click="editQuestion">
			                <v-icon color="green" >edit</v-icon>
			            </v-btn>
			            <v-btn icon small class="ml-5 mb-5" @click="deleteQuestion">
			                <v-icon color="red">delete</v-icon>
			            </v-btn>
			        </v-card-actions>

			        <v-spacer></v-spacer>
			        <v-spacer></v-spacer>

			        <v-btn color="green" class="ml-5 mb-5">5 Replies</v-btn>
			    </v-card>
			</template>

			<script>
			    import md from 'marked'

			    export default {
			        props:['question'],

			        data() {
			            return {
			                own : User.own(this.question.id)
			            }
			        },

			        computed: {
			            body() {
			                return md.parse(this.question.body)
			            }
			        },

			        methods: {
			            deleteQuestion() {
			                axios.delete(`/api/questions/${this.$route.params.slug}`)
			                    .then(res => this.$router.push('/forum'))
			                    .catch(error => console.log(error))
			            },

			            editQuestion() {
			                EventBus.$emit('startEditing')
			            }
			        }
			    }
			</script>

			<style>
			    
			</style>

		#resources->js->components->forum->SingleQuestion.vue
			<template>
			    <div>
			        <div v-if="editing">
			            <EditQuestion :question = question></EditQuestion>
			        </div>
			        <div v-else>
			            <ShowQuestion :question = question v-if="question"></ShowQuestion>
			        </div>
			    </div>
			</template>

			<script>
			    import ShowQuestion from "./ShowQuestion"
			    import EditQuestion from "./EditQuestion"

			    export default {
			        name: "SingleQuestion",

			        components: {ShowQuestion, EditQuestion},

			        data(){
			            return {
			                question: null,
			                editing: false
			            }
			        },

			        created(){
			            this.listen()
			            this.getQuestion()
			        },

			        methods: {
			            listen() {
			                EventBus.$on('startEditing', () => {
			                    this.editing = true
			                }),

			                EventBus.$on('cancelEditing', () => {
			                    this.editing = false
			                })
			            },

			            getQuestion() {
			                axios.get(`/api/questions/${this.$route.params.slug}`)
			                    .then(res => this.question = res.data.data)
			                    .catch(error => console.log(error.response.data))
			        
			            }
			        }

			    }
			</script>

			<style>

			</style>

		#resources->js->components->forum->EditQuestion.vue
			<template>
			    <v-container>
			        <v-form @submit.prevent = "saveEdit">
			            <v-text-field
			            v-model="editForm.title"
			            type="text"
			            label="Title"
			            required
			            ></v-text-field>

			            <vue-simplemde v-model="editForm.body" ref="markdownEditor" />

			            <v-card-actions>
			                <v-btn icon small class="mb-5" type="submit">
			                    <v-icon color="green" >save</v-icon>
			                </v-btn>

			                <v-btn icon small class="mb-5" @click="cancelEdit">
			                    <v-icon color="black" >cancel</v-icon>
			                </v-btn>
			            </v-card-actions>
			        </v-form>
			    </v-container>
			</template>

			<script>
			    export default {
			        name: "EditQuestion",

			        props: ['question'],

			        data(){
			            return {
			                editForm: {
			                    title: null,
			                    body: null,
			                },
			            }
			        },

			        mounted() {
			            this.editForm = this.question
			        },

			        methods: {
			            cancelEdit() {
			                EventBus.$emit('cancelEditing')
			            },

			            saveEdit() {
			                axios.put(`/api/questions/${this.$route.params.slug}`, this.editForm)
			                    .then(res => this.cancelEdit())
			                    .catch(error => console.log(error))
			            }
			        }

			    }
			</script>

			<style>

			</style>

		#app->Http->Model->Question
			#protected $guarded = []; takes in everything which is not good for update as it will generate the error in created_at field.

			protected $fillable = ['title', 'slug', 'body', 'category_id', 'user_id'];



16) Frontend Categories CRUD
	[16.1] Display Category
		#Modify sidebar in Forum.vue to add categories
			#resources->js->components->forum->Forum.vue
				<template>
				    <v-container fluid grid-list-md>
				        <v-layout row wrap>
				            <v-flex xs8>
				                <Questions v-for="question in questions" :key="question.path" :question=question>
				                        
				                </Questions>
				            </v-flex>

				            <v-flex xs4>
				                <Sidebar>
				                        
				                </Sidebar>
				            </v-flex>
				        </v-layout>
				    </v-container>
				</template>

				<script>
				    import Questions from "./Questions"
				    import Sidebar from "./Sidebar"

				    export default {
				        name: "Forum",

				        components: {Questions, Sidebar},

				        data() {
				            return {
				                questions: {}
				            }
				        },

				        created(){
				            axios.get('/api/questions')
				                .then(res => this.questions = res.data.data)
				                .catch(error => console.log(error.response.data))
				        }
				    }
				</script>

				<style>

				</style>

		#Create a new component Sidebar
			#resources->js->components->forum->Forum.vue
				<template>
				    <v-card>
				        <v-toolbar color="green" dark>
				            <v-toolbar-title >Categories</v-toolbar-title>
				        </v-toolbar>
				        
				        <v-list>
				            <v-list-tile v-for="category in categories" :key="category.id">
				                <v-list-tile-content>
				                    <v-list-tile-title class="ml-5">
				                        {{category.name}}<br><br>
				                    </v-list-tile-title>
				                </v-list-tile-content>
				            </v-list-tile>
				        </v-list>

				    </v-card>
				</template>

				<script>
				    export default {
				        name: "Sidebar",

				        data() {
				            return {
				                categories: {}
				            }
				        },

				        created() {
				            axios.get('api/categories')
				                .then(res => this.categories = res.data.data)
				                .catch(error => error.response.data)
				        }
				    }
				</script>

				<style>

				</style>

	[16.2] Create and show Category with edit and delete button
		#Add category route in the router file
			#resources->js->router->router.js
				import Vue from 'vue'
				import VueRouter from 'vue-router'

				import Login from'../components/login/Login'
				import Logout from'../components/login/Logout'
				import Signup from'../components/login/Signup'
				import Forum from'../components/forum/Forum'
				import SingleQuestion from'../components/forum/SingleQuestion'
				import AskQuestion from'../components/forum/AskQuestion'
				import Category from'../components/category/Category'

				Vue.use(VueRouter)

				const routes = [
				    { path: '/login', component: Login },
				    { path: '/logout', component: Logout },
				    { path: '/signup', component: Signup },
				    { path: '/forum', component: Forum, name:"Forum" },
				    { path: '/questions/:slug', component: SingleQuestion, name:"SingleQuestion" },
				    { path: '/askquestion', component: AskQuestion },
				    { path: '/category', component: Category }
				]

				const router = new VueRouter({
				    routes,
				    mode: 'history',
				    hash: false
				})

		#Make sure route-key is set to slug
			#app->Model->Category
				public function getRouteKeyName()
			    {
			        return 'slug';
			    }

		#add the category slug mannually through Category Resource
			$app->Http->resources->CategoryResource
				public function toArray($request)
			    {
			        return [
			            'name' => $this->name,
			            'id' => $this->id,
			            'slug' => $this->slug
			        ];
			    }

			#Important points:
				#Unlike question, category is showed on the same page rather than a new one which is why the route does not have a slug in it. Due to this issue. axios.delete(`/api/categories/${this.$route.params.slug}`) can not be used. Therfore, we had to add the category slug mannually through Category Resource.

		#Create a new category folder and Category.vue file
			#resources->js->components->category->Category.vue
				<template>
				    <v-container>
				        <v-form @submit.prevent = "submitCategory">
				            <v-text-field
				            v-model="categoryForm.name"
				            type="text"
				            label="Category Name"
				            required
				            ></v-text-field>

				            <v-btn color="pink" type="submit" v-if="hasSlug">Update</v-btn>
				            <v-btn color="success" type="submit" v-else>Create</v-btn>
				        </v-form>

				        <v-card>
				            <v-toolbar color="green" dark>
				                <v-toolbar-title >Categories</v-toolbar-title>
				            </v-toolbar>
				            
				            <v-list>
				                <div v-for="(category, index) in categories" :key="category.id">
				                    <v-list-item>
				                        <v-card-actions class="ml-5">
				                            <v-btn icon small @click="editCategory(index)">
				                                <v-icon color="green" >edit</v-icon>
				                            </v-btn>
				                            <v-btn icon small class="ml-5" @click="deleteCategory(category.slug, index)">
				                                <v-icon color="red">delete</v-icon>
				                            </v-btn>
				                        </v-card-actions>

				                        <v-list-item-content>
				                            <v-list-item-title class="ml-5">
				                                {{category.name}}<br><br>
				                            </v-list-item-title>
				                        </v-list-item-content>
				                    </v-list-item>

				                     <v-divider></v-divider>
				                </div>
				            </v-list>  
				        </v-card>
				    </v-container>
				</template>

				<script>
				    export default {
				        name: "Category",

				        data(){
				            return {
				                categoryForm: {
				                    name: null,
				                },
				                categories: {},
				                errors: {},
				                hasSlug: null
				            }
				        },

				        created() {
				            axios.get('api/categories')
				                .then(res => this.categories = res.data.data)
				                .catch(error => error.response.data)
				        },

				        methods:{
				            submitCategory() {
				                this.hasSlug ? this.updateCategory() : this.createCategory()
				            },

				            createCategory() {
				                axios.post('/api/categories', this.categoryForm)
				                    .then(res => {
				                        this.categories.unshift(res.data)
				                        this.categoryForm.name = null
				                    })
				                    .catch(error => this.errors = error.response.data.error)
				            },

				            editCategory(index) { //if slug is not passed
				                this.categoryForm.name = this.categories[index].name
				                this.hasSlug = this.categories[index].slug
				                this.categories.splice(index, 1)
				            }

				            updateCategory() {
				                axios.put(`/api/categories/${this.hasSlug}`, this.categoryForm)
				                    .then(res => {
				                        this.categories.unshift(res.data)
				                        this.categoryForm.name = null
				                    })
				                    .catch(error => this.errors = error.response.data.error)
				            },

				            deleteCategory(slug, index) {
				                axios.delete(`/api/categories/${slug}`) 
				                    .then(res => this.categories.splice(index, 1))
				                    .catch(error => console.log(error))
				            }
				        }

				    }
				</script>

				<style>

				</style>

			#Return the updated category instead of an "updated" message 
				#app->Http->Controllers->CategoryController
					public function update(Request $request, Category $category)
				    {
				        $category->update(
				            [
				                'name' => $request->name,
				                'slug' => Str::slug($request->name)
				            ]
				        );

				        return response(new CategoryResource($category), 202);
				    }

			#Important points:
				#1) Once the category is created, it wont display in the list right away as the page is not refreshed. to solve this issue, this.categories.unshift(res.data) is used which will put the newly created list on the top of the list.

				#2) Because all the categories with edit and delete buttons are displayed on the same page, we have to pass the slug (as route-key has been set to slug) along with the index (as index is required for this.categories.splice(index, 1) to the deleteCategory function.

				#3) Once the axios.delete request is successful, the category will be deleted from the database but it will still be displayed on this list as page in not refreshed. To solve this issue, this.categories.splice(index, 1) is used which will remove the category from the list without refresh.

				#4) Unlike question, as everything is on the same page and we need to display it on the top of the list without refresh, the updated category is returned rather than an "updated" message.

		#Only admin can edit categories
			#Add an admin function with random id to compare it to loggedin id
				#resources->js->helpers->user.js
					import Token from './token'
					import Storage from './storage'

					class User {
					    login(data) {
					        axios.post('/api/auth/login', data)
					            .then(res => this.responseAfterLogin(res))
					            .catch(error => console.log(error.response.data))
					    }

					    signup(data) {
					        axios.post('/api/auth/signup', data)
					            .then(res => this.responseAfterLogin(res))
					            .catch(error => this.errors = error.response.data.errors)
					    }

					    responseAfterLogin(res) {
					        const token = res.data.access_token
					        const username = res.data.user

					        if(Token.isValid(token))
					        {
					            console.log(token)
					            Storage.store(token, username)
					            window.location = "/forum"
					        }
					    }

					    hasToken() {
					        const storedToken = Storage.getToken()
					        if(storedToken){
					            return Token.isValid(storedToken) ? true : false
					        }

					        return false
					    }

					    loggedIn() {
					        return this.hasToken()
					    }

					    logout(){
					        Storage.clear()
					        window.location = "/forum"
					    }

					    name() {
					        if(this.loggedIn()){
					            return Storage.getUsername()
					        }
					    }

					    id() { //id is the sub: part of the payload
					        if(this.loggedIn()){
					            const payload = Token.getPayload(Storage.getToken())
					            return payload.sub
					        }
					    }

					    own(id) {
					        return this.id() == id
					    }

					    admin() {
					        return this.id() == 10
					    }
					}

					export default User = new User();

			#Edit Toolbar.vue to show category button only if admin is loggedin
				#resources->js->components->Toolbar.vue
					<template>
					    <v-card
					        flat
					        height="100px"
					        tile
					    >
					        <v-toolbar>
					            <v-toolbar-title>Forum SPA</v-toolbar-title>
					            <v-spacer></v-spacer>
					            <div>
					                <router-link v-for="item in items" :key="item.title" :to="item.to" v-if="item.show">
					                    <v-btn >{{item.title}}</v-btn>
					                </router-link>
					            </div>
					        </v-toolbar>
					    </v-card>
					</template>

					<script>
					    export default {
					        name: "Toolbar",

					        created() {
					            EventBus.$on('logout', () => {
					                User.logout()
					            })
					        },

					        data(){
					            return {
					                items: [
					                    {title: 'Forum', to: '/forum', show: true},
					                    {title: 'Ask Question', to: '/askquestion', show: User.loggedIn()},
					                    {title: 'Category', to: '/category', show: User.admin()},
					                    {title: 'Login', to: '/login', show: !User.loggedIn()},
					                    {title: 'Logout', to: '/logout', show: User.loggedIn()},             
					                ]
					            }
					        }
					    }
					</script>

					<style>

					</style>



17) Frontend Replies CRUD
	[17.1] Display all the replies
		#Decide the relationship you want to load using protected $with
			#app->Model->Question
				<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;
				use App\User;

				class Question extends Model
				{
				    

				    public function user()
				    {
				        return $this->belongsTo(User::class);
				    }

				    public function replies()
				    {
				        return $this->hasMany(Reply::class);
				    }

				    public function category()
				    {
				        return $this->belongsTo(Category::class);
				    }

				    public function getRouteKeyName()
				    {
				        return 'slug';
				    }

				    public function getPathAttribute()
				    {
				        return "questions/$this->slug";
				    }

				    protected $fillable = ['title', 'slug', 'body', 'category_id', 'user_id'];

				    protected $with = ['replies'];
				    
				    //protected $guarded = [];
				}

		#Display through resources
			#app->Controller->reosources->QuestionResource
				public function toArray($request)
			    {
			        return [
			            'title' => $this->title,
			            'path' => $this->path,
			            'body' => $this->body,
			            'replies' => ReplyResource::collection($this->replies),
			            'replies_count' => $this->replies->count(),
			            'created_at' => $this->created_at->diffForHumans(),
			            'user' => $this->user->name,
			            'id' => $this->user_id
			        ];
			    }

		#import the Replies.vue component in the SingleQuestion.vue
			#resources->js->components->forum->SingleQuestion.vue
				<template>
				    <div>
				        <div v-if="editing">
				            <EditQuestion :question = question></EditQuestion>
				        </div>

				        <div v-else>
				            <ShowQuestion :question = question v-if="question"></ShowQuestion>
				        </div>

				        <Replies :question = question></Replies>
				    </div>
				</template>

				<script>
				    import ShowQuestion from "./ShowQuestion"
				    import EditQuestion from "./EditQuestion"
				    import Replies from "../reply/Replies"

				    export default {
				        name: "SingleQuestion",

				        components: {ShowQuestion, EditQuestion, Replies},

				        data(){
				            return {
				                question: null,
				                editing: false
				            }
				        },

				        created(){
				            this.listen()
				            this.getQuestion()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('startEditing', () => {
				                    this.editing = true
				                }),

				                EventBus.$on('cancelEditing', () => {
				                    this.editing = false
				                })
				            },

				            getQuestion() {
				                axios.get(`/api/questions/${this.$route.params.slug}`)
				                    .then(res => this.question = res.data.data)
				                    .catch(error => console.log(error.response.data))
				            }
				        }

				    }
				</script>

				<style>

				</style>

		#Create a new reply folder inside the components with Replies.vue
			#resources->js->components->reply->Replies.vue
				<template>
				    <v-container v-if="question">
				            <ShowReply v-for="reply in question.replies"  :key="reply.id" :reply = reply>

				            </ShowReply>
				    </v-container>
				</template>

				<script>
				    import ShowReply from "./ShowReply"

				    export default {
				        name: "Replies",

				        components: {ShowReply},

				        props:['question'],
				        
				    }
				</script>

				<style>
				    
				</style>

		#Modify the RelpyResources
			#app->Controller->reosources->ReplyResource
				public function toArray($request)
			    {
			        return [
			            'id' => $this->id,
			            'body' => $this->body,
			            'user' => $this->user->name,
			            'user_id' => $this->user_id,
			            'created_at' => $this->created_at->diffForHumans(),
			        ];
			    }

		#Create a new component ShowReply.vue
			#resources->js->components->reply->ShowReply.vue
				<template>
				    <v-container>
				        <v-card class="mx-auto mb-5" max-width="700" outlined>
				            <v-list-item three-line>
				                <v-list-item-content>
				                    <v-card-title class="headline mb-1">{{reply.user}}</v-card-title>
				                    <v-card-subtitle>said : {{reply.created_at}}</v-card-subtitle>
				                    <v-card-text>{{reply.body}}</v-card-text>

				                    <v-card-actions v-if="own">
				                        <v-btn icon small class="mb-5">
				                            <v-icon color="green" >edit</v-icon>
				                        </v-btn>
				                        <v-btn icon small class="ml-5 mb-5">
				                            <v-icon color="red">delete</v-icon>
				                        </v-btn>
				                    </v-card-actions>
				                </v-list-item-content>
				            </v-list-item>
				        </v-card>
				    </v-container>
				</template>

				<script>
				    export default {
				        name: "ShowReply",

				        props:['reply'],

				        data() {
				            return {
				                own : User.own(this.reply.user_id)
				            }
				        },
				    }
				</script>

				<style>
				    
				</style>

	[17.2] Create a new reply
		#Import the Replies.vue component in the SingleQuestion.vue
			#resources->js->components->forum->SingleQuestion.vue
				<template>
				    <div>
				        <div v-if="editing">
				            <EditQuestion :question = question></EditQuestion>
				        </div>

				        <div v-else>
				            <ShowQuestion :question = question v-if="question"></ShowQuestion>
				        </div>

				        <CreateReply></CreateReply>

				        <Replies :question = question></Replies>
				    </div>
				</template>

				<script>
				    import ShowQuestion from "./ShowQuestion"
				    import EditQuestion from "./EditQuestion"
				    import Replies from "../reply/Replies"
				    import CreateReply from "../reply/CreateReply"

				    export default {
				        name: "SingleQuestion",

				        components: {ShowQuestion, EditQuestion, Replies, CreateReply},

				        data(){
				            return {
				                question: null,
				                editing: false
				            }
				        },

				        created(){
				            this.listen()
				            this.getQuestion()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('startEditing', () => {
				                    this.editing = true
				                }),

				                EventBus.$on('cancelEditing', () => {
				                    this.editing = false
				                })
				            },

				            getQuestion() {
				                axios.get(`/api/questions/${this.$route.params.slug}`)
				                    .then(res => this.question = res.data.data)
				                    .catch(error => console.log(error.response.data))
				            }
				        }

				    }
				</script>

				<style>

				</style>

		#Create a new component CreateReply.vue
			#resources->js->components->reply->CreateReply.vue
				<template>
				    <v-container>
				        <vue-simplemde v-model="replyForm.body" ref="markdownEditor" />

				        <v-btn color="success" type="submit" dark @click="createReply">
				            Reply
				        </v-btn>
				    </v-container>
				</template>

				<script>
				    export default {
				        name: "CreateReply",

				        data(){
				            return {
				                replyForm: {
				                    body: null,
				                },
				                errors: {}
				            }
				        },

				        methods:{
				            createReply() {
				                axios.post(`/api/questions/${this.$route.params.slug}/replies`, this.replyForm)
				                    .then(res => {
				                        this.replyForm.body = ''
				                        EventBus.$emit('creatingReply', res.data.reply)
				                        window.scrollTo(0,0)
				                    })
				                    .catch(error => this.errors = error.response.data.error)
				            }
				        }

				    }
				</script>

				<style>

				</style>

		#Listen the event to component Replies.vue which displays the replies
			#resources->js->components->reply->Replies.vue
				<template>
				    <v-container v-if="question">
				            <ShowReply v-for="reply in question.replies"  :key="reply.id" :reply = reply>

				            </ShowReply>
				    </v-container>
				</template>

				<script>
				    import ShowReply from "./ShowReply"

				    export default {
				        name: "Replies",

				        components: {ShowReply},

				        props:['question'],

				        created() {
				            this.listen()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('creatingReply', (reply) => {
				                    this.question.replies.unshift(reply)
				                })
				            }
				        }
				        
				    }
				</script>

				<style>
				    
				</style>


		#Modify the store function of the ReplyController
			#app->Http->Controllers->ReplyController
				public function store(Question $question, Request $request)
			    {
			        $reply = new Reply;

					$reply->body = $request->body;
					$reply->question_id = $question->id;
			        $reply->user_id = auth()->id();

			        $reply->save();
			        
			        return response(['reply' => new ReplyResource($reply)], 201);
			    }

			    #OR (By using $request->all)

			    public function store(Question $question, Request $request)
			    {
			        $reply = $question->replies()->create($request->all());
			    }

			    #app->Http->Model->Reply
			    	<?php

					namespace App\Model;

					use Illuminate\Database\Eloquent\Model;
					use App\User;

					class Reply extends Model
					{
					    protected static function boot()
					    {
					        parent::boot();

					        static::creating(function($reply) {
					            $reply->user_id = auth()->id();
					        });
					    }

					    public function question()
					    {
					        return $this->belongsTo(Question::class);
					    }

					    public function user()
					    {
					        return $this->belongsTo(User::class);
					    }

					    public function likes()
					    {
					        return $this->hasMany(Like::class);
					    }

					    public function getPathAttribute()
					    {
					        return "questions/$this->slug";
					    }

					    protected $guarded = [];
					}

			#This part is a little tricky as we need the id of parent (question) and grand-parent (user).

		#Display the latest reply first
			#app->Http->Model->Question
				public function replies()
			    {
			        return $this->hasMany(Reply::class)->latest();
			    }

			#As we are using collection, we need to add latest() in the question model's replies relationship

	[17.3] Delete reply
		#Emit the delete event
			#resources->js->components->reply->ShowReply.vue
				<template>
				    <v-container>
				        <v-card class="mx-auto mb-5" max-width="700" outlined>
				            <v-list-item three-line>
				                <v-list-item-content>
				                    <v-card-title class="headline mb-1">{{reply.user}}</v-card-title>
				                    <v-card-subtitle>said : {{reply.created_at}}</v-card-subtitle>
				                    <v-card-text>{{reply.body}}</v-card-text>

				                    <v-card-actions v-if="own">
				                        <v-btn icon small class="mb-5">
				                            <v-icon color="green" >edit</v-icon>
				                        </v-btn>
				                        <v-btn icon small class="ml-5 mb-5" @click="deleteReply">
				                            <v-icon color="red">delete</v-icon>
				                        </v-btn>
				                    </v-card-actions>
				                </v-list-item-content>
				            </v-list-item>
				        </v-card>
				    </v-container>
				</template>

				<script>
				    export default {
				        name: "ShowReply",

				        props:['reply', 'index'],

				        data() {
				            return {
				                own : User.own(this.reply.user_id)
				            }
				        },

				        methods: {
				            deleteReply() {
				                EventBus.$emit('deletingReply', this.index)
				            }
				        }
				    }
				</script>

				<style>
				    
				</style>

		#Listen the delete event
			#resources->js->components->reply->Replies.vue
				<template>
				    <v-container v-if="question">
				            <ShowReply v-for="(reply, index) in question.replies"  :key="reply.id" :reply = reply :index = index>

				            </ShowReply>
				    </v-container>
				</template>

				<script>
				    import ShowReply from "./ShowReply"

				    export default {
				        name: "Replies",

				        components: {ShowReply},

				        props:['question'],

				        created() {
				            this.listen()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('creatingReply', (reply) => {
				                    this.question.replies.unshift(reply)
				                })

				                EventBus.$on('deletingReply', (index) => {
				                    axios.delete(`/api/questions/${this.$route.params.slug}/replies/${this.question.replies[index].id}`)
				                        .then(res => {
				                            this.question.replies.splice(index,1)
				                        })
				                })
				            }
				        }
				        
				    }
				</script>

				<style>
				    
				</style>

	[17.4] Edit reply
		#Listen events in ShowReply.vue
			#resources->js->components->reply->ShowReply.vue
				<template>
				    <v-container>
				        <v-card class="mx-auto mb-5" max-width="700" outlined>
				            <v-list-item three-line>
				                <v-list-item-content>
				                    <v-card-title class="headline mb-1">{{reply.user}}</v-card-title>
				                    <v-card-subtitle>said : {{reply.created_at}}</v-card-subtitle>
				                    
				                    <div v-if="editing">
				                        <EditReply :reply = reply></EditReply>
				                    </div>

				                    <div v-else>
				                        <v-card-text v-html="body"></v-card-text>                    
				                    
				                        <v-card-actions v-if="own">
				                            <v-btn icon small class="mb-5" @click="editReply">
				                                <v-icon color="green" >edit</v-icon>
				                            </v-btn>
				                            <v-btn icon small class="ml-5 mb-5" @click="deleteReply">
				                                <v-icon color="red">delete</v-icon>
				                            </v-btn>
				                        </v-card-actions>   
				                    </div>
				                </v-list-item-content>
				            </v-list-item>
				        </v-card>
				    </v-container>
				</template>

				<script>
				    import md from 'marked'
				    import EditReply from "./EditReply"

				    export default {
				        name: "ShowReply",

				        components: {EditReply},

				        props:['reply', 'index'],

				        data() {
				            return {
				                own : User.own(this.reply.user_id),
				                editing: false
				            }
				        },

				        computed: {
				            body() {
				                return md.parse(this.reply.body)
				            }
				        },

				        created() {
				            this.listen()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('cancelEditing', ()=>{
				                    this.editing = false
				                })
				            },

				            deleteReply() {
				                EventBus.$emit('deletingReply', this.index)
				            },

				            editReply() {
				                this.editing = true
				            }
				        }
				    }
				</script>

				<style>
				    
				</style>

		#Create new component EditReply.vue
			#resources->js->components->reply->EditReply.vue
				<template>
				    <v-container>
				        <v-form>
				            <vue-simplemde v-model="reply.body" ref="markdownEditor" />

				            <v-card-actions>
				                <v-btn icon small class="mb-5" @click="saveEdit">
				                    <v-icon color="green" >save</v-icon>
				                </v-btn>

				                <v-btn icon small class="mb-5" @click="cancelEdit">
				                    <v-icon color="black" >cancel</v-icon>
				                </v-btn>
				            </v-card-actions>
				        </v-form>
				    </v-container>
				</template>

				<script>
				    export default {
				        name: "EditReply",

				        props: ['reply'],

				        methods: {
				            cancelEdit() {
				                EventBus.$emit('cancelEditing')
				            },

				            saveEdit() {
				                axios.put(`/api/questions/${this.$route.params.slug}/replies/${this.reply.id}`, {body: this.reply.body})
				                    .then(res => this.cancelEdit())
				            }
				        }

				    }
				</script>

				<style>

				</style>



18) Frontend Likes
	[18.1] Modify LikeController to add the loggedin user
		#app->Http->Controller->LikeController
			public function likeIt(Reply $reply)
		    {
		        $reply->likes()->create([ #reply_id will be added automatically
		            'user_id' => auth()->id()
		            //'user_id' => '1'
		        ]);
		    }

		    public function unlikeIt(Reply $reply)
		    {
		        $reply->likes()->where('user_id', auth()->id())->first()->delete();
		        //$reply->likes()->where('user_id', '1')->first()->delete();

		    }

	[18.2] Add new fields to count total likes and to make sure if logged in user has liked that reply or not
		#app->Http->Resources->ReplyResouce
			return [
            'id' => $this->id,
            'body' => $this->body,
            'user' => $this->user->name,
            'user_id' => $this->user_id,
            'like_count' => $this->likes->count(),
            'liked' => !! $this->likes->where('user_id', auth()->id())->count(),
            'created_at' => $this->created_at->diffForHumans(),
        ];

        #In 'liked', count is used which will give answer in 0 or 1. Then, using !! it is converted to boolean
 
	[18.3] Add Like component in the ShowReply.vue
		#resources->js->components->reply->ShowReply.vue
			<template>
			    <v-container>
			        <v-card class="mx-auto mb-5" max-width="700" outlined>
			            <v-list-item three-line>
			                <v-list-item-content>
			                    <v-card-title class="headline mb-1">{{reply.user}}</v-card-title>
			                    <v-card-subtitle>said : {{reply.created_at}}</v-card-subtitle>
			                    
			                    <div v-if="editing">
			                        <EditReply :reply = reply></EditReply>
			                    </div>

			                    <div v-else>
			                        <v-card-text v-html="body"></v-card-text>                    
			                    
			                        <v-card-actions v-if="own">
			                            <v-btn icon small class="mb-5" @click="editReply">
			                                <v-icon color="green" >edit</v-icon>
			                            </v-btn>
			                            <v-btn icon small class="ml-5 mb-5" @click="deleteReply">
			                                <v-icon color="red">delete</v-icon>
			                            </v-btn>
			                        </v-card-actions>  

			                        <v-spacer></v-spacer>

			                        <Like :reply = reply></Like>
			                    </div>
			                </v-list-item-content>
			            </v-list-item>
			        </v-card>
			    </v-container>
			</template>

			<script>
			    import md from 'marked'
			    import EditReply from "./EditReply"
			    import Like from "../like/Like"


			    export default {
			        name: "ShowReply",

			        components: {EditReply, Like},

			        props:['reply', 'index'],

			        data() {
			            return {
			                own : User.own(this.reply.user_id),
			                editing: false,
			                beforeEditing: ''
			            }
			        },

			        computed: {
			            body() {
			                return md.parse(this.reply.body)
			            }
			        },

			        created() {
			            this.listen()
			        },

			        methods: {
			            listen() {
			                EventBus.$on('cancelEditing', (reply)=>{
			                    this.editing = false

			                    if(reply != this.reply.body) {
			                        this.reply.body = this.beforeEditing
			                        this.beforeEditing = ''
			                    }
			                })
			            },

			            deleteReply() {
			                EventBus.$emit('deletingReply', this.index)
			            },

			            editReply() {
			                this.editing = true
			                this.beforeEditing = this.reply.body
			            }
			        }
			    }
			</script>

			<style>
			    
			</style>

	[18.3] Edit Like component to make like and dislike function work
		#resources->js->components->like->Like.vue
			<template>
			    <div>
			        <v-card>
			            <v-card-text>
			                <v-btn icon @click="likeIt">
			                    <v-icon :color="color">thumb_up</v-icon>
			                </v-btn>
			                {{count}}
			            </v-card-text>
			        </v-card>
			    </div>
			</template>

			<script>
			    import axios from 'axios';

			    export default {
			        name: "Like",

			        props: ['reply'],
			        
			        data() {
			            return {
			                liked: this.reply.liked,
			                count: this.reply.like_count
			            }
			        },

			        computed: {
			            color() {
			                return this.liked ? 'green' : 'gray'
			            }
			        },

			        methods: {
			            likeIt() {
			                if(User.loggedIn) {
			                    this.liked ? this.removeLike() : this.addLike()
			                    this.liked = !this.liked
			                }
			            },

			            addLike() {
			                axios.post(`/api/${this.reply.id}/like`)
			                    .then(res => this.count ++)
			            },

			            removeLike() {
			                axios.delete(`/api/${this.reply.id}/like`)
			                    .then(res => this.count --)
			            }
			        }
			    }
			</script>

			<style>

			</style>




19) Notification
	[19.1] Create notification system
		#Make notification using Laravel documentation
			php artisan make:notification NewReplyNotification

			php artisan notifications:table

			php artisan migrate

	[19.2] Make it work on the backend
		#Make changes in the store function to notify the user
			#app->Http->Controllers->ReplyController
				use App\Notifications\NewReplyNotification;

				public function store(Question $question, Request $request)
			    {
			        //$reply = $question->replies()->create($request->all());

			        $reply = new Reply;

					$reply->body = $request->body;
					$reply->question_id = $question->id;
			        $reply->user_id = auth()->id();

			        $reply->save();

			        $user = $question->user;
			        $user->notify(new NewReplyNotification($reply));

			        return response(['reply' => new ReplyResource($reply)], 201);
			    }




		#Catch reply in NewReplyNNotification and return array in database
			#app->Notifications->NewReplyNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				use App\Model\Reply;


				class NewReplyNotification extends Notification
				{
				    use Queueable;

				    /**
				     * Create a new notification instance.
				     *
				     * @return void
				     */
				    public function __construct(Reply $reply)
				    {
				        $this->reply = $reply;
				    }

				    /**
				     * Get the notification's delivery channels.
				     *
				     * @param  mixed  $notifiable
				     * @return array
				     */
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    /**
				     * Get the array representation of the notification.
				     *
				     * @param  mixed  $notifiable
				     * @return array
				     */
				    public function toArray($notifiable)
				    {
				        return [
				            'replyBy' => $this->reply->user->name,
				            'question' => $this->reply->question->title,
				            'path' => $this->reply->question->path,
				        ];
				    }
				}


	[19.3] Make it work on the Frontend
		#Set the notification routes
			#app->routes->apiResource
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				use App\User;

				Route::middleware('auth:api')->get('/user', function (Request $request) {
				    return $request->user();
				});

				Route::apiResource('/questions', 'QuestionController');

				Route::apiResource('/categories', 'CategoryController');

				Route::apiResource('/questions/{question}/replies', 'ReplyController');

				Route::post('/{reply}/like', 'LikeController@likeIt');
				Route::delete('/{reply}/like', 'LikeController@unlikeIt');

				Route::post('notifications', function() {
				    return [
				        'read' => auth()->user()->readNotifications,
				        'unread' => auth()->user()->unreadNotifications,
				    ];
				});

				Route::group([

				    'middleware' => 'api',
				    'prefix' => 'auth'

				], function ($router) {

				    Route::post('login', 'AuthController@login');
				    Route::post('logout', 'AuthController@logout');
				    Route::post('refresh', 'AuthController@refresh');
				    Route::post('me', 'AuthController@me');
				    Route::post('signup', 'AuthController@signup');

				});

		#Create a new Notifications component
			#resources->js->components->Notifications.vue
				<template>
				    <div class="text-center">
				        <v-menu offset-y>
				            <template v-slot:activator="{ on }">
				                <v-btn icon v-on="on">
				                    <v-icon color="red">add_alert</v-icon>
				                </v-btn>

				                {{unreadCount}}
				            </template>

				            <v-list>
				                <v-list-item v-for="item in unread" :key="item.id">
				                    <v-list-item-title>{{item.data.question}}</v-list-item-title>
				                </v-list-item>
				            </v-list>
				        </v-menu>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {
				        name: "Notifications",

				        data() {
				            return {
				                read: {},
				                unread: {},
				                unreadCount: 5
				            }
				        },

				        created() {
				            if(User.loggedIn()) {
				                this.getNotifications()
				            }
				        },

				        methods: {
				            getNotifications() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                        console.log(this.read)
				                        console.log(this.unread)
				                    })
				            }
				        }
				    }
				</script>

				<style>

				</style>

		#Import Notification.vue in the Toolbar component
			#resources->js->components->Toolbar.vue
				<template>
				    <v-card
				        flat
				        height="100px"
				        tile
				    >
				        <v-toolbar>
				            <v-toolbar-title>Forum SPA</v-toolbar-title>
				            <v-spacer></v-spacer>

				            <Notifications></Notifications>
				            
				            <div>
				                <router-link v-for="item in items" :key="item.title" :to="item.to">
				                    <v-btn  v-if="item.show">{{item.title}}</v-btn>
				                </router-link>
				            </div>
				        </v-toolbar>
				    </v-card>
				</template>

				<script>
				    import Notifications from'./Notifications'

				    export default {
				        name: "Toolbar",

				        components: {Notifications},

				        created() {
				            EventBus.$on('logout', () => {
				                User.logout()
				            })
				        },

				        data(){
				            return {
				                items: [
				                    {title: 'Forum', to: '/forum', show: true},
				                    {title: 'Ask Question', to: '/askquestion', show: User.loggedIn()},
				                    {title: 'Category', to: '/category', show: User.admin()},
				                    {title: 'Login', to: '/login', show: !User.loggedIn()},
				                    {title: 'Logout', to: '/logout', show: User.loggedIn()},             
				                ]
				            }
				        }
				    }
				</script>

				<style>

				</style>

	[19.4] Mark as read notifications
		#Make NotificationResource as if read will be empty it won' have all the fields as unread
			php artisan make:resource NotificationResource

			#app->Http->Resources->NotificationResource
				public function toArray($request)
			    {
			        return [
			            'id' => $this->id,
			            'replyBy' => $this->data['replyBy'],
			            'question' => $this->data['question'],
			            'path' => $this->data['path'],
			        ];
			    }

		#Move all notification requests to controller and change the api routes respectively
			#app->>routes->api
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				use App\User;

				Route::middleware('auth:api')->get('/user', function (Request $request) {
				    return $request->user();
				});

				Route::apiResource('/questions', 'QuestionController');

				Route::apiResource('/categories', 'CategoryController');

				Route::apiResource('/questions/{question}/replies', 'ReplyController');

				Route::post('/{reply}/like', 'LikeController@likeIt');
				Route::delete('/{reply}/like', 'LikeController@unlikeIt');

				Route::post('/notifications', 'NotificationController@index');
				Route::post('/markasread', 'NotificationController@markAsRead');

				Route::group([

				    'middleware' => 'api',
				    'prefix' => 'auth'

				], function ($router) {

				    Route::post('login', 'AuthController@login');
				    Route::post('logout', 'AuthController@logout');
				    Route::post('refresh', 'AuthController@refresh');
				    Route::post('me', 'AuthController@me');
				    Route::post('signup', 'AuthController@signup');

				});

		#Make controller for all the Notificaiton requests and use resource
			php artisan make:controller NotificationController

			#app->Http->Controllers->NotificationController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\NotificationResource;

				class NotificationController extends Controller
				{
				    public function index()
				    {
				        return [
				            'read' => NotificationResource::collection(auth()->user()->readNotifications),
				            'unread' => NotificationResource::collection(auth()->user()->unreadNotifications)
				        ];
				    }

				    public function markAsRead(Request $request)
				    {
				        auth()->user()->notifications->where('id', $request->id)->markAsRead();
				    }
				}

		#Display both read and unread notifications
			#app->resources->js->components->Notifications.vue
				<template>
				    <div class="text-center">
				        <v-menu offset-y>
				            <template v-slot:activator="{ on }">
				                <v-btn icon v-on="on">
				                    <v-icon :color="color">add_alert</v-icon>
				                </v-btn>
				                {{unreadCount}}
				            </template>

				            <v-list>
				                <v-list-item v-for="item in unread" :key="item.id">
				                    <router-link :to="item.path">
				                        <v-list-item-title @click="markRead(item)">{{item.question}}</v-list-item-title>
				                    </router-link>
				                </v-list-item>
				            </v-list>

				            <v-divider></v-divider>

				            <v-list>
				                <v-list-item v-for="item in read" :key="item.id">
				                    {{item.question}}
				                </v-list-item>
				            </v-list>

				        </v-menu>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {
				        name: "Notifications",

				        data() {
				            return {
				                read: {},
				                unread: {},
				                unreadCount: 0
				            }
				        },

				        computed: {
				            color() {
				                return this.unreadCount > 0 ? 'red' : 'gray';
				            }
				        },

				        created() {
				            if(User.loggedIn()) {
				                this.getNotifications()
				            }
				        },

				        methods: {
				            getNotifications() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                    })
				            },

				            markRead(notification) {
				                axios.post('/api/markasread', {id: notification.id})
				                    .then(res => {
				                        this.unread.splice(notification, 1)
				                        this.read.push(notification)
				                        this.unreadCount --
				                    })
				            }
				        }
				    }
				</script>

				<style>

				</style>

		#Make minor changes in the Toolbar
			#resources->js->components->Toolbar.vue
				<template>
				    <v-card
				        flat
				        height="100px"
				        tile
				    >
				        <v-toolbar>
				            <v-toolbar-title>Forum SPA</v-toolbar-title>
				            <v-spacer></v-spacer>

				            <Notifications v-if="loggedIn"></Notifications>
				            
				            <div>
				                <router-link v-for="item in items" :key="item.title" :to="item.to">
				                    &ensp; <v-btn  v-if="item.show">{{item.title}}</v-btn> 
				                </router-link>
				            </div>
				        </v-toolbar>
				    </v-card>
				</template>

				<script>
				    import Notifications from'./Notifications'

				    export default {
				        name: "Toolbar",

				        components: {Notifications},

				        created() {
				            EventBus.$on('logout', () => {
				                User.logout()
				            })
				        },

				        data(){
				            return {
				                items: [
				                    {title: 'Forum', to: '/forum', show: true},
				                    {title: 'Ask Question', to: '/askquestion', show: User.loggedIn()},
				                    {title: 'Category', to: '/category', show: User.admin()},
				                    {title: 'Login', to: '/login', show: !User.loggedIn()},
				                    {title: 'Logout', to: '/logout', show: User.loggedIn()},             
				                ],

				                loggedIn: User.loggedIn()
				            }
				        }
				    }
				</script>

				<style>
				    a {  text-decoration: none;}
				</style>

		#Edit ReplyController to make sure user does not notify when he comments on his own question
			#app->Http->Controllers->ReplyController
			    public function store(Question $question, Request $request)
			    {
			        //$reply = $question->replies()->create($request->all());

			        $reply = new Reply;

					$reply->body = $request->body;
					$reply->question_id = $question->id;
			        $reply->user_id = auth()->id();

			        $reply->save();

			        $user = $question->user;

			        if($reply->user_id != $question->user_id) {
			            $user->notify(new NewReplyNotification($reply));
			        }

			        return response(['reply' => new ReplyResource($reply)], 201);
			    }




20) Pusher - Make things Real-Time
	[20.1] Install Pusher
		#Install Pusher from the Lara Docs using composer
			composer require pusher/pusher-php-server "~4.0"

		#Sign-up Pusher.com->create app
			#Copy App Keys details to the .env file
				PUSHER_APP_ID=972129
				PUSHER_APP_KEY=d7a022bb282e518231ad
				PUSHER_APP_SECRET=29cf66d0f13df7c7d10c
				PUSHER_APP_CLUSTER=ap4

		#Install Laravel-echo
			npm install --save laravel-echo pusher-js

		#Set-up echo in bootsrap.js
			#resources->js->bootstrap.js (Uncomment the bottom part of the file)
				import Echo from 'laravel-echo';

				window.Pusher = require('pusher-js');

				window.Echo = new Echo({
				    broadcaster: 'pusher',
				    key: "d7a022bb282e518231ad",
				    cluster: "ap4",
				    encrypted: true
				});

		#Configure Broadcasting
			#config->broadcasting.php
				#Set-up according to the documentation if not set-up automatically

			#config->app.php
				#uncomment App\Providers\BroadcastServiceProvider::class in the Providers

		#Restart the server

	[20.2] Real-Time Likes Backend
		#Add an event in the EventServiceProvider
			#app->Providers->EventServiceProvider
				protected $listen = [
			        'App\Events\LikeEvent' => [
			            'App\Listeners\LikeEventListener',
			        ],
    			];
    	#Make like events and listeners folder in app
			php artisan event:generate (It creates the file in the Events)

		#Broadcasting events using Laravel->Broadcast to others
			#app->Http->Controllers->LikeController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Like;
				use App\Model\Reply;
				use Illuminate\Http\Request;

				use App\Events\LikeEvent;

				class LikeController extends Controller
				{
				    /**
				     * Create a new AuthController instance.
				     *
				     * @return void
				     */
				    public function __construct()
				    {
						$this->middleware('JWT');
				    }

				    public function likeIt(Reply $reply)
				    {
				        $reply->likes()->create([ #reply_id will be added automatically
				            'user_id' => auth()->id()
				        ]);

				        broadcast(new LikeEvent($reply->id, 1))->toOthers();
				    }

				    public function unlikeIt(Reply $reply)
				    {
				        $reply->likes()->where('user_id', auth()->id())->first()->delete();

				        broadcast(new LikeEvent($reply->id, 0))->toOthers();
				    }
				}

		#Broadcast like channel and edit construct
			#app->Events->LikeEvent
				<?php

				namespace App\Events;

				use Illuminate\Broadcasting\Channel;
				use Illuminate\Broadcasting\InteractsWithSockets;
				use Illuminate\Broadcasting\PresenceChannel;
				use Illuminate\Broadcasting\PrivateChannel;
				use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
				use Illuminate\Foundation\Events\Dispatchable;
				use Illuminate\Queue\SerializesModels;

				class LikeEvent implements ShouldBroadcast
				{
				    use Dispatchable, InteractsWithSockets, SerializesModels;

				    public $id;
				    public $type;
				    /**
				     * Create a new event instance.
				     *
				     * @return void
				     */
				    public function __construct($id, $type)
				    {
				        $this->id = $id;
				        $this->type = $type;
				    }

				    /**
				     * Get the channels the event should broadcast on.
				     *
				     * @return \Illuminate\Broadcasting\Channel|array
				     */
				    public function broadcastOn()
				    {
				        return new Channel('likeChannel');
				    }
				}

		#Add the likeChannel
			#routes->channels.php
				Broadcast::channel('likeChannel', function () {
				    return true;
				});

		
		#Set broadcast driver to Pusher in .env
			BROADCAST_DRIVER=pusher

		#Restart the server

		#Go to pusher website to check if connection is Successful
			#Refresh the forum page along with debug console of Pusher. The connection to the local host should be displayed.

			#Like any reply and check the debug console. It should display the data of the reply that has been liked

	[20.3] Real-Time Likes Frontkend
		#listen event in the created() of Like.vue using Laravel->Receving Broadcast->Listening the event
			#resources->js->components->like->Like.vue
				<template>
				    <div>
				        <v-card>
				            <v-card-text>
				                <v-btn icon @click="likeIt">
				                    <v-icon :color="color">thumb_up</v-icon>
				                </v-btn>
				                {{count}}
				            </v-card-text>
				        </v-card>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {
				        name: "Like",

				        props: ['reply'],
				        
				        data() {
				            return {
				                liked: this.reply.liked,
				                count: this.reply.like_count
				            }
				        },

				        computed: {
				            color() {
				                return this.liked ? 'green' : 'gray'
				            }
				        },

				        created() {
				            Echo.channel('likeChannel')
				                .listen('LikeEvent', (e) => {
				                    if(this.reply.id == e.id) {
				                        e.type == 1? this.count ++ : this.count --
				                    }
				                    //console.log(e);
				                });
				        },

				        methods: {
				            likeIt() {
				                if(User.loggedIn) {
				                    this.liked ? this.removeLike() : this.addLike()
				                    this.liked = !this.liked
				                }
				            },

				            addLike() {
				                axios.post(`/api/${this.reply.id}/like`)
				                    .then(res => this.count ++)
				            },

				            removeLike() {
				                axios.delete(`/api/${this.reply.id}/like`)
				                    .then(res => this.count --)
				            }
				        }
				    }
				</script>

				<style>

				</style>


	[20.4] Broadcasting notifications and send token to Pusher
		#Add toBroadcast() from Laravel->Broadcast notifications->Formatting broadcast notification
			#app->Notifications->NewReplyNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				use App\Model\Reply;
				use Illuminate\Notifications\Messages\BroadcastMessage;
				use App\Http\Resources\ReplyResource;

				class NewReplyNotification extends Notification
				{
				    use Queueable;

				    public $reply;

				    /**
				     * Create a new notification instance.
				     *
				     * @return void
				     */
				    public function __construct(Reply $reply)
				    {
				        $this->reply = $reply;
				    }

				    /**
				     * Get the notification's delivery channels.
				     *
				     * @param  mixed  $notifiable
				     * @return array
				     */
				    public function via($notifiable)
				    {
				        return ['database', 'broadcast'];
				    }

				    /**
				     * Get the array representation of the notification.
				     *
				     * @param  mixed  $notifiable
				     * @return array
				     */
				    public function toArray($notifiable)
				    {
				        return [
				            'replyBy' => $this->reply->user->name,
				            'question' => $this->reply->question->title,
				            'path' => $this->reply->question->path,
				        ];
				    }

				    public function toBroadcast($notifiable)
				    {
				        return new BroadcastMessage([
				            'replyBy' => $this->reply->user->name,
				            'question' => $this->reply->question->title,
				            'path' => $this->reply->question->path,
				            'reply' => new ReplyResource($this->reply)
				        ]);
				    }
				}

		#Listen using Echo.private->Laravel->Broadcast notifications->Listening for notifications
			#resources->js->components->reply->Replies.vue
				Echo.private('App.User.' + userId())
				    .notification((notification) => {
				        console.log(notification.type);
				    });

	[20.5] Sending JWT token for Pusher
		#Pass the header in the bootstrap.js
			#resources->js->bootstrap.js
				window._ = require('lodash');

				/**
				 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
				 * for JavaScript based Bootstrap features such as modals and tabs. This
				 * code may be modified to fit the specific needs of your application.
				 */

				try {
				    window.Popper = require('popper.js').default;
				    window.$ = window.jQuery = require('jquery');

				    require('bootstrap');
				} catch (e) {}

				/**
				 * We'll load the axios HTTP library which allows us to easily issue requests
				 * to our Laravel back-end. This library automatically handles sending the
				 * CSRF token as a header based on the value of the "XSRF" token cookie.
				 */

				window.axios = require('axios');

				window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

				const JwtToken = `Bearer ${localStorage.getItem('token')}`
				window.axios.defaults.headers.common['Authorization'] = JwtToken;

				/**
				 * Next we will register the CSRF Token as a common header with Axios so that
				 * all outgoing HTTP requests automatically have it attached. This is just
				 * a simple convenience so we don't have to attach every token manually.
				 */

				let token = document.head.querySelector('meta[name="csrf-token"]');

				if (token) {
				    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
				} else {
				    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
				}

				/**
				 * Echo exposes an expressive API for subscribing to channels and listening
				 * for events that are broadcast by Laravel. Echo and event broadcasting
				 * allows your team to easily build robust real-time web applications.
				 */

				import Echo from 'laravel-echo';

				window.Pusher = require('pusher-js');

				window.Echo = new Echo({
				    broadcaster: 'pusher',
				    key: "d7a022bb282e518231ad",
				    cluster: "ap4",
				    encrypted: true,
				    auth: {
				        headers: {
				            Authorization: JwtToken
				        }
				    }
				});

		#Add middlewarein the broadcast route
			#app->Providers->BroadcastServiceProvider
				<?php

				namespace App\Providers;

				use Illuminate\Support\Facades\Broadcast;
				use Illuminate\Support\ServiceProvider;

				class BroadcastServiceProvider extends ServiceProvider
				{
				    /**
				     * Bootstrap any application services.
				     *
				     * @return void
				     */
				    public function boot()
				    {
				        Broadcast::routes(['middleware' => ['auth:api']]);

				        require base_path('routes/channels.php');
				    }
				}

	[20.6] Make replya and notification real-time
		#Make the reply real-time
			#resources->js->components->reply->Replies.vue
				<template>
				    <v-container v-if="question">
				            <ShowReply v-for="(reply, index) in question.replies"  :key="reply.id" :reply = reply :index = index>

				            </ShowReply>
				    </v-container>
				</template>

				<script>
				    import ShowReply from "./ShowReply"

				    export default {
				        name: "Replies",

				        components: {ShowReply},

				        props:['question'],

				        created() {
				            this.listen()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('creatingReply', (reply) => {
				                    this.question.replies.unshift(reply)
				                })

				                EventBus.$on('deletingReply', (index) => {
				                    axios.delete(`/api/questions/${this.$route.params.slug}/replies/${this.question.replies[index].id}`)
				                        .then(res => {
				                            this.question.replies.splice(index,1)
				                        })
				                })

				                Echo.private('App.User.' + User.id())
								    .notification((notification) => {
				                        this.question.replies.unshift(notification.reply)
				                        //console.log(notification.type)
								    });
				            }
				        }
				    }
				</script>

				<style>
				    
				</style>

		#Make notification real-time
			#resources->js->components->Notification.vue
				<template>
				    <div class="text-center">
				        <v-menu offset-y>
				            <template v-slot:activator="{ on }">
				                <v-btn icon v-on="on">
				                    <v-icon :color="color">add_alert</v-icon>
				                </v-btn>
				                {{unreadCount}}
				            </template>

				            <v-list>
				                <v-list-item v-for="item in unread" :key="item.id">
				                    <router-link :to="item.path">
				                        <v-list-item-title @click="markRead(item)">{{item.question}}</v-list-item-title>
				                    </router-link>
				                </v-list-item>
				            </v-list>

				            <v-divider></v-divider>

				            <v-list>
				                <v-list-item v-for="item in read" :key="item.id">
				                    {{item.question}}
				                </v-list-item>
				            </v-list>

				        </v-menu>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {
				        name: "Notifications",

				        data() {
				            return {
				                read: {},
				                unread: {},
				                unreadCount: 0
				            }
				        },

				        computed: {
				            color() {
				                return this.unreadCount > 0 ? 'red' : 'gray';
				            }
				        },

				        created() {
				            if(User.loggedIn()) {
				                this.getNotifications()
				            }

				            Echo.private('App.User.' + User.id())
				                .notification((notification) => {
				                    this.unread.unshift(notification)
				                    this.unreadCount ++
				                    //console.log(notification.type)
				                });
				        },

				        methods: {
				            getNotifications() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                    })
				            },

				            markRead(notification) {
				                axios.post('/api/markasread', {id: notification.id})
				                    .then(res => {
				                        this.unread.splice(notification, 1)
				                        this.read.push(notification)
				                        this.unreadCount --
				                    })
				            }
				        }
				    }
				</script>

				<style>

				</style>

	[20.7] Make real-time delete reply
		#Create a new delete event
			#app->Providers->EventServiceProvider
				protected $listen = [
			        'App\Events\LikeEvent' => [
			            'App\Listeners\LikeEventListener',
			        ],

			        'App\Events\DeleteReplyEvent' => [
			            'App\Listeners\DeleteReplyEventListener',
			        ],
			    ];

		#Generate the event from the terminal
			php artisan event:generate

		#Edit the DeleteReplyEvent
			#app->Events->DeleteReplyEvent
				<?php

				namespace App\Events;

				use Illuminate\Broadcasting\Channel;
				use Illuminate\Broadcasting\InteractsWithSockets;
				use Illuminate\Broadcasting\PresenceChannel;
				use Illuminate\Broadcasting\PrivateChannel;
				use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
				use Illuminate\Foundation\Events\Dispatchable;
				use Illuminate\Queue\SerializesModels;

				class DeleteReplyEvent implements ShouldBroadcast
				{
				    use Dispatchable, InteractsWithSockets, SerializesModels;

				    public $id;
				    /**
				     * Create a new event instance.
				     *
				     * @return void
				     */
				    public function __construct($id)
				    {
				        $this->id = $id;
				    }

				    /**
				     * Get the channels the event should broadcast on.
				     *
				     * @return \Illuminate\Broadcasting\Channel|array
				     */
				    public function broadcastOn()
				    {
				        return new Channel('deleteReplyChannel');
				    }
				}

		#Broadcast DeleteReplyEvent in the ReplyController
			#app->Http->Controllers->ReplyController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Reply;
				use App\Model\Question;
				use Illuminate\Http\Request;
				use App\Http\Resources\ReplyResource;
				use App\Notifications\NewReplyNotification;
				use App\Events\DeleteReplyEvent;


				class ReplyController extends Controller
				{
				    /**
				     * Create a new AuthController instance.
				     *
				     * @return void
				     */
				    public function __construct()
				    {
						$this->middleware('JWT', ['except' => ['index', 'show']]);
				    }
				    
				    /**
				     * Display a listing of the resource.
				     *
				     * @return \Illuminate\Http\Response
				     */
				    public function index(Question $question)
				    {
				        return ReplyResource::collection($question->replies);
				    }

				    /**
				     * Store a newly created resource in storage.
				     *
				     * @param  \Illuminate\Http\Request  $request
				     * @return \Illuminate\Http\Response
				     */
				    public function store(Question $question, Request $request)
				    {
				        //$reply = $question->replies()->create($request->all());

				        $reply = new Reply;

						$reply->body = $request->body;
						$reply->question_id = $question->id;
				        $reply->user_id = auth()->id();

				        $reply->save();

				        $user = $question->user;
				        
				        if($reply->user_id != $question->user_id) {
				            $user->notify(new NewReplyNotification($reply));
				        }

				        return response(['reply' => new ReplyResource($reply)], 201);
				    }

				    /**
				     * Display the specified resource.
				     *
				     * @param  \App\Model\Reply  $reply
				     * @return \Illuminate\Http\Response
				     */
				    public function show(Question $question, Reply $reply)
				    {
				        return new ReplyResource($reply);
				    }

				    /**
				     * Update the specified resource in storage.
				     *
				     * @param  \Illuminate\Http\Request  $request
				     * @param  \App\Model\Reply  $reply
				     * @return \Illuminate\Http\Response
				     */
				    public function update(Question $question, Request $request, Reply $reply)
				    {
				        $reply->update($request->all());
				        return response('Updated', 202);
				    }

				    /**
				     * Remove the specified resource from storage.
				     *
				     * @param  \App\Model\Reply  $reply
				     * @return \Illuminate\Http\Response
				     */
				    public function destroy(Question $question,Reply $reply)
				    {
				        $reply->delete();

				        broadcast(new DeleteReplyEvent($reply->id))->toOthers();

				        return response('Deleted', 201);
				    }
				}

		#Listen to the event to delete the reply
			#resources->js->components->reply->Replies.vue
				<template>
				    <v-container v-if="question">
				            <ShowReply v-for="(reply, index) in question.replies"  :key="reply.id" :reply = reply :index = index>

				            </ShowReply>
				    </v-container>
				</template>

				<script>
				    import ShowReply from "./ShowReply"

				    export default {
				        name: "Replies",

				        components: {ShowReply},

				        props:['question'],

				        created() {
				            this.listen()
				        },

				        methods: {
				            listen() {
				                EventBus.$on('creatingReply', (reply) => {
				                    this.question.replies.unshift(reply)
				                })

				                EventBus.$on('deletingReply', (index) => {
				                    axios.delete(`/api/questions/${this.$route.params.slug}/replies/${this.question.replies[index].id}`)
				                        .then(res => {
				                            this.question.replies.splice(index,1)
				                        })
				                })

				                Echo.private('App.User.' + User.id())
								    .notification((notification) => {
				                        this.question.replies.unshift(notification.reply)
				                        //console.log(notification.type)
				                    });
				                    
				                Echo.channel('deleteReplyChannel')
				                    .listen('DeleteReplyEvent', (e) => {
				                        for(let index = 0; index< this.question.replies.length; index++) {
				                            if(this.question.replies[index].id == e.id) {
				                                this.question.replies.splice(index, 1)
				                            }
				                        }
				                    })
				            }
				        }
				    }
				</script>

				<style>
				    
				</style>




21) Bug Fixes
	[21.1] User must be logged out once the token is expired
		#Add jwt middleware in NotificationController just like any other controllers
			#app->Http->Controllers->NotificationController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\NotificationResource;

				class NotificationController extends Controller
				{
				    /**
				     * Create a new AuthController instance.
				     *
				     * @return void
				     */
				    public function __construct()
				    {
						$this->middleware('JWT');
				    }
				    
				    public function index()
				    {
				        return [
				            'read' => NotificationResource::collection(auth()->user()->readNotifications),
				            'unread' => NotificationResource::collection(auth()->user()->unreadNotifications)
				        ];
				    }

				    public function markasread(Request $request)
				    {
				        auth()->user()->notifications->where('id', $request->id)->markAsRead();
				    }
				}

		#Create a new js file to handle exception in the Frontend
			#resources->js->helpers->exception.
				import User from './user.js'

				class Exception {
				    handle(error) {
				        this.isExpired(error.response.data.error)
				    }

				    isExpired(error) {
				        if(error = 'Token is invalid') {
				            User.logout()
				        }
				    }
				}

				export default Exception = new Exception()

		#Import the exception file in app.js
			#resources->js->app.js
				require('./bootstrap');

				window.Vue = require('vue');

				import Vue from 'vue'
				import Vuetify from 'vuetify';
				import router from './router/router.js';

				import User from './helpers/user.js';
				window.User = User

				import Exception from './exception/exception.js';
				window.Exception = Exception

				console.log(User.loggedIn())

				window.EventBus = new Vue();

				Vue.use(Vuetify);

				import VueSimplemde from 'vue-simplemde'
				import 'simplemde/dist/simplemde.min.css'

				Vue.component('vue-simplemde', VueSimplemde)

				Vue.component('Home', require('./components/Home.vue').default);

				const app = new Vue({
				    el: '#app',
				    vuetify: new Vuetify(),
				    router
				});

		#User the isExpired function in the Notification.vue to catch error
			#resources->js->components->Notifications.vue
				<template>
				    <div class="text-center">
				        <v-menu offset-y>
				            <template v-slot:activator="{ on }">
				                <v-btn icon v-on="on">
				                    <v-icon :color="color">add_alert</v-icon>
				                </v-btn>
				                {{unreadCount}}
				            </template>

				            <v-list>
				                <v-list-item v-for="item in unread" :key="item.id">
				                    <router-link :to="item.path">
				                        <v-list-item-title @click="markRead(item)">{{item.question}}</v-list-item-title>
				                    </router-link>
				                </v-list-item>
				            </v-list>

				            <v-divider></v-divider>

				            <v-list>
				                <v-list-item v-for="item in read" :key="item.id">
				                    {{item.question}}
				                </v-list-item>
				            </v-list>

				        </v-menu>
				    </div>
				</template>

				<script>
				    import axios from 'axios';

				    export default {
				        name: "Notifications",

				        data() {
				            return {
				                read: {},
				                unread: {},
				                unreadCount: 0
				            }
				        },

				        computed: {
				            color() {
				                return this.unreadCount > 0 ? 'red' : 'gray';
				            }
				        },

				        created() {
				            if(User.loggedIn()) {
				                this.getNotifications()
				            }

				            Echo.private('App.User.' + User.id())
				                .notification((notification) => {
				                    this.unread.unshift(notification)
				                    this.unreadCount ++
				                    //console.log(notification.type)
				                });
				        },

				        methods: {
				            getNotifications() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                    })
				                    .catch(error => Exception.handle(error))
				            },

				            markRead(notification) {
				                axios.post('/api/markasread', {id: notification.id})
				                    .then(res => {
				                        this.unread.splice(notification, 1)
				                        this.read.push(notification)
				                        this.unreadCount --
				                    })
				            }
				        }
				    }
				</script>

				<style>

				</style>

	[21.2] User must not pass a fake string as token
		#Add isBase64 function in token.js
			#resources->js->helpers->token.js
				class Token {
				    isValid(token) {
				        const payload = this.getPayload(token)
				        if(payload) {
				            return payload.iss == "http://127.0.0.1:8000/api/auth/login" || "http://127.0.0.1:8000/api/auth/signup" ? true :
				            false
				        }

				        return false
				    }

				    getPayload(token) {
				        const payload = token.split('.')[1]
				        return this.decode(payload)
				    }

				    decode(payload) {
				        if(this.isBase64(payload)) {
				            return JSON.parse(atob(payload)) //Decode the token to make it look better
				        }
				        return false
				    }

				    isBase64(str) {
				        try {
				            return btoa(atob(str)).replace(/=/g, "") == str
				        }
				        catch(err) {
				            return false
				        }
				    }
				}

				export default Token = new Token();

	[21.3] User must logout and storage must be cleared if the token invalid
		#resources->js->helpers->user.js
			import Token from './token'
			import Storage from './storage'

			class User {
			    login(data) {
			        axios.post('/api/auth/login', data)
			            .then(res => this.responseAfterLogin(res))
			            .catch(error => console.log(error.response.data))
			    }

			    signup(data) {
			        axios.post('/api/auth/signup', data)
			            .then(res => this.responseAfterLogin(res))
			            .catch(error => this.errors = error.response.data.errors)
			    }

			    responseAfterLogin(res) {
			        const token = res.data.access_token
			        const username = res.data.user

			        if(Token.isValid(token))
			        {
			            console.log(token)
			            Storage.store(token, username)
			            window.location = "/forum"
			        }
			    }

			    hasToken() {
			        const storedToken = Storage.getToken()
			        if(storedToken){
			            return Token.isValid(storedToken) ? true : this.logout()
			        }

			        return false
			    }

			    loggedIn() {
			        return this.hasToken()
			    }

			    logout(){
			        Storage.clear()
			        window.location = "/forum"
			    }

			    name() {
			        if(this.loggedIn()){
			            return Storage.getUsername()
			        }
			    }

			    id() { //id is the sub: part of the payload
			        if(this.loggedIn()){
			            const payload = Token.getPayload(Storage.getToken())
			            return payload.sub
			        }
			    }

			    own(id) {
			        return this.id() == id
			    }

			    admin() {
			        return this.id() == 10
			    }
			}

			export default User = new User();

	[21.4] Hide creating reply if not logged in
		#resources->js->components->forum->SingleQuestion.vue
			<template>
			    <div>
			        <div v-if="editing">
			            <EditQuestion :question = question></EditQuestion>
			        </div>

			        <div v-else>
			            <ShowQuestion :question = question v-if="question"></ShowQuestion>
			        </div>

			        <CreateReply v-if="loggedIn"></CreateReply>

			        <router-link v-else to="/login" >
			            <v-btn class="ml-5" color="green" dark>Login to reply</v-btn> 
			        </router-link>
			        
			        <Replies :question = question></Replies>
			    </div>
			</template>

			<script>
			    import ShowQuestion from "./ShowQuestion"
			    import EditQuestion from "./EditQuestion"
			    import Replies from "../reply/Replies"
			    import CreateReply from "../reply/CreateReply"

			    export default {
			        name: "SingleQuestion",

			        components: {ShowQuestion, EditQuestion, Replies, CreateReply},

			        data(){
			            return {
			                question: null,
			                editing: false
			            }
			        },

			        computed: {
			            loggedIn() {
			                return User.loggedIn()
			            }
			        },

			        created(){
			            this.listen()
			            this.getQuestion()
			        },

			        methods: {
			            listen() {
			                EventBus.$on('startEditing', () => {
			                    this.editing = true
			                }),

			                EventBus.$on('cancelEditing', () => {
			                    this.editing = false
			                })
			            },

			            getQuestion() {
			                axios.get(`/api/questions/${this.$route.params.slug}`)
			                    .then(res => this.question = res.data.data)
			                    .catch(error => console.log(error.response.data))
			            }
			        }

			    }
			</script>

			<style>

			</style>


	[21.5] Update the reply count right away once new reply is added/deleted
		#resources->js->components->forum->ShowQuestion.vue
			<template>
			    <v-card
			        class="mx-auto mb-5"
			        outlined
			    >
			        <v-list-item three-line>
			            <v-list-item-content>
			                <v-card-title class="headline mb-1">{{question.title}}</v-card-title>
			                <v-card-subtitle>{{question.user}} : {{question.created_at}}</v-card-subtitle>
			                <v-card-text class=" mb-5 mt-4"  v-html="body"></v-card-text>
			            </v-list-item-content>
			        </v-list-item>

			        <v-card-actions class="ml-5" v-if="own">
			            <v-btn icon small class="mb-5" @click="editQuestion">
			                <v-icon color="green" >edit</v-icon>
			            </v-btn>
			            <v-btn icon small class="ml-5 mb-5" @click="deleteQuestion">
			                <v-icon color="red">delete</v-icon>
			            </v-btn>
			        </v-card-actions>

			        <v-spacer></v-spacer>
			        
			        <v-btn color="green" class="ml-5 mb-5" dark>{{replyCount}} Replies</v-btn>
			    </v-card>
			</template>

			<script>
			    import md from 'marked'

			    export default {
			        name: "ShowQuestion",

			        props:['question'],

			        data() {
			            return {
			                own : User.own(this.question.id),
			                replyCount: this.question.replies_count
			            }
			        },

			        computed: {
			            body() {
			                return md.parse(this.question.body)
			            }
			        },

			        created() {
			            EventBus.$on('creatingReply', () => {
			                this.replyCount++
			            })

			            Echo.private('App.User.' + User.id())
			                .notification((notification) => {
			                    this.replyCount++
			                });
			            
			            EventBus.$on('deletingReply', () => {
			                this.replyCount--
			            })

			            Echo.channel('deleteReplyChannel')
			                .listen('DeleteReplyEvent', (e) => {
			                    this.replyCount--
			                })
			        },

			        methods: {
			            deleteQuestion() {
			                axios.delete(`/api/questions/${this.$route.params.slug}`)
			                    .then(res => this.$router.push('/forum'))
			                    .catch(error => console.log(error))
			            },

			            editQuestion() {
			                EventBus.$emit('startEditing')
			            }
			        }
			    }
			</script>

			<style>
			    
			</style>

	[21.6] Parallex in Home page	
		#Create the Parallex component
			#reosources->js->components->Parallex.vue
				<template>
				    <v-parallax
				        dark
				        src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
				        height="700"
				    >
				        <v-row
				        align="center"
				        justify="center"
				        
				        >
				        <v-col class="text-center" cols="12">
				            <h1 class="display-4 font-weight-thin mb-4">Vuetify.js</h1>
				            <h4 class="subheading">Build your application today!</h4>
				        </v-col>
				        </v-row>
				    </v-parallax>
				</template>

				<script>
				    export default {
				        name: "Parallex",
				    }
				</script>

				<style>

				</style>

		#Define the route for Parallex 
			#resources->js->router->router.js
				import Vue from 'vue'
				import VueRouter from 'vue-router'

				import Parallex from'../components/Parallex'
				import Login from'../components/login/Login'
				import Logout from'../components/login/Logout'
				import Signup from'../components/login/Signup'
				import Forum from'../components/forum/Forum'
				import SingleQuestion from'../components/forum/SingleQuestion'
				import AskQuestion from'../components/forum/AskQuestion'
				import Category from'../components/category/Category'

				Vue.use(VueRouter)

				const routes = [
				    { path: '/', component: Parallex },
				    { path: '/login', component: Login },
				    { path: '/logout', component: Logout },
				    { path: '/signup', component: Signup },
				    { path: '/forum', component: Forum, name:"Forum" },
				    { path: '/questions/:slug', component: SingleQuestion, name:"SingleQuestion" },
				    { path: '/askquestion', component: AskQuestion },
				    { path: '/category', component: Category }
				]

				const router = new VueRouter({
				    routes,
				    mode: 'history',
				    hash: false
				})

				export default router

	[21.7] Validation for empty value in AskQuestion/Category
		#Validation for question
			#Make a new request
				php artisan make:request QuestionRequest

			#Add rules in these requests
				#app->Http->Requests->QuestionRequest
					<?php

					namespace App\Http\Requests;

					use Illuminate\Foundation\Http\FormRequest;

					class QuestionRequest extends FormRequest
					{
					    /**
					     * Determine if the user is authorized to make this request.
					     *
					     * @return bool
					     */
					    public function authorize()
					    {
					        return true;
					    }

					    /**
					     * Get the validation rules that apply to the request.
					     *
					     * @return array
					     */
					    public function rules()
					    {
					        return [
					            'title' => 'required',
					            'body' => 'required',
					            'category_id' => 'required'
					        ];
					    }
					}


			#Add this request in the store function of QuestionController
				#app->Http->Controllers->QuestionController
					<?php

					namespace App\Http\Controllers;

					use Illuminate\Database\Eloquent\Model;
					use App\Model\Question;
					use Illuminate\Http\Request;
					use App\Http\Resources\QuestionResource;
					use Illuminate\Support\Str;
					use App\Http\Requests\QuestionRequest;


					class QuestionController extends Controller
					{
					    /**
					     * Create a new AuthController instance.
					     *
					     * @return void
					     */
					    public function __construct()
					    {
							$this->middleware('JWT', ['except' => ['index', 'show']]);
					    }

					    /**
					     * Display a listing of the resource.
					     *
					     * @return \Illuminate\Http\Response
					     */
					    public function index()
					    {
					        return QuestionResource::collection(Question::latest()->get());
					    }

					    /**
					     * Store a newly created resource in storage.
					     *
					     * @param  \Illuminate\Http\Request  $request
					     * @return \Illuminate\Http\Response
					     */
					    public function store(QuestionRequest $request)
					    {
					        $request['slug'] = Str::slug($request->title);
					        $question = auth()->user()->questions()->create($request->all()); 
					         
					        return response(new QuestionResource($question), 201);
					    }

					    /**
					     * Display the specified resource.
					     *
					     * @param  \App\Model\Question  $question
					     * @return \Illuminate\Http\Response
					     */
					    public function show(Question $question)
					    {
					        return new QuestionResource($question);
					    }

					    /**
					     * Update the specified resource in storage.
					     *
					     * @param  \Illuminate\Http\Request  $request
					     * @param  \App\Model\Question  $question
					     * @return \Illuminate\Http\Response
					     */
					    public function update(Request $request, Question $question)
					    {
					        $question->update($request->all());
					        return response('Updated', 202);
					    }

					    /**
					     * Remove the specified resource from storage.
					     *
					     * @param  \App\Model\Question  $question
					     * @return \Illuminate\Http\Response
					     */
					    public function destroy(Question $question)
					    {
					        $question->delete();
					        return response('Deleted', 201);
					    }
					}

			#Disable to create button in the Frontend
				#resources->js->components->forum->AskQuestion.vue
					<template>
					    <v-container>
					        <v-form @submit.prevent = "askQuestion">
					            <v-text-field
					            v-model="questionForm.title"
					            type="text"
					            label="Title"
					            required
					            ></v-text-field>

					            <v-select
					                :items="categories"
					                item-text="name"
					                item-value="id"
					                v-model="questionForm.category_id"
					                label="Category"
					                autocomplete
					            ></v-select>

					            <vue-simplemde v-model="questionForm.body" ref="markdownEditor" />

					            <v-btn
					                color="success"
					                type="submit"
					                :disabled="disableButton"
					                >
					                Create
					            </v-btn>
					        </v-form>
					    </v-container>
					</template>

					<script>
					    export default {
					        name: "AskQuestion",

					        data(){
					            return {
					                questionForm: {
					                    title: null,
					                    body: null,
					                    category_id: null
					                },
					                categories: {},
					                errors: {}
					            }
					        },

					        computed: {
					            disableButton() {
					                return !(this.questionForm.title && this.questionForm.body && this.questionForm.category_id)
					            }
					        },

					        created() {
					            axios.get('/api/categories')
					                .then(res => this.categories = res.data.data)
					        },

					        methods:{
					            askQuestion() {
					                axios.post('/api/questions', this.questionForm)
					                    .then(res => this.$router.push(res.data.path))
					                    .catch(error => this.errors = error.response.data.error)
					            }
					        }

					    }
					</script>

					<style>

					</style>

		#Validation for Category
			#Make a new request
				php artisan make:request CategoryRequest

			#Add rules in these requests
				#app->Http->Requests->CategoryRequest
					<?php

					namespace App\Http\Requests;

					use Illuminate\Foundation\Http\FormRequest;

					class CategoryRequest extends FormRequest
					{
					    /**
					     * Determine if the user is authorized to make this request.
					     *
					     * @return bool
					     */
					    public function authorize()
					    {
					        return true;
					    }

					    /**
					     * Get the validation rules that apply to the request.
					     *
					     * @return array
					     */
					    public function rules()
					    {
					        return [
					            'name' => 'required'
					        ];
					    }
					}

			#Add this request and return created category in the store function of CategoryController
				#app->Http->Controllers->CategoryController
					<?php

					namespace App\Http\Controllers;

					use App\Model\Category;
					use Illuminate\Http\Request;
					use Illuminate\Support\Str;
					use App\Http\Resources\CategoryResource;
					use App\Http\Requests\CategoryRequest;


					class CategoryController extends Controller
					{
					    /**
					     * Create a new AuthController instance.
					     *
					     * @return void
					     */
					    public function __construct()
					    {
							$this->middleware('JWT', ['except' => ['index', 'show']]);
					    }
					    
					    /**
					     * Display a listing of the resource.
					     *
					     * @return \Illuminate\Http\Response
					     */
					    public function index()
					    {
					        return CategoryResource::collection(Category::latest()->get());
					    }

					    /**
					     * Store a newly created resource in storage.
					     *
					     * @param  \Illuminate\Http\Request  $request
					     * @return \Illuminate\Http\Response
					     */
					    public function store(CategoryRequest $request)
					    {
					        //Question::create($request->all());

					        $category = new Category;
					        $category->name  = $request->name;
					        $category->slug  = Str::slug($request->name);
					        $category->save();

					        return response(['category' => new CategoryResource($category)], 201);
					    }

					    /**
					     * Display the specified resource.
					     *
					     * @param  \App\Model\Category  $category
					     * @return \Illuminate\Http\Response
					     */
					    public function show(Category $category)
					    {
					        return new CategoryResource($category);
					    }

					    /**
					     * Update the specified resource in storage.
					     *
					     * @param  \Illuminate\Http\Request  $request
					     * @param  \App\Model\Category  $category
					     * @return \Illuminate\Http\Response
					     */
					    public function update(Request $request, Category $category)
					    {
					        $category->update(
					            [
					                'name' => $request->name,
					                'slug' => Str::slug($request->name)
					            ]
					        );

					        return response(new CategoryResource($category), 202);
					    }

					    /**
					     * Remove the specified resource from storage.
					     *
					     * @param  \App\Model\Category  $category
					     * @return \Illuminate\Http\Response
					     */
					    public function destroy(Category $category)
					    {
					        $category->delete();
					        return response('Deleted', 201);
					    }
					}

			#Display errors (rather than disableButton) and unshift res.data.category in createCategory()
				#resources->js->components->category->Category.vue
					<template>
					    <v-container>
					        <v-alert type="error" v-if="errors">
					            {{errors.name[0]}}
					        </v-alert>
					        <v-form @submit.prevent = "submitCategory">
					            <v-text-field
					            v-model="categoryForm.name"
					            type="text"
					            label="Category Name"
					            required
					            ></v-text-field>

					            <v-btn color="pink" type="submit" v-if="hasSlug">Update</v-btn>
					            <v-btn color="success" type="submit" v-else>Create</v-btn>
					        </v-form>

					        <br><br>

					        <v-card>
					            <v-toolbar color="green" dark>
					                <v-toolbar-title >Categories</v-toolbar-title>
					            </v-toolbar>
					            
					            <v-list>
					                <div v-for="(category, index) in categories" :key="category.id">
					                    <v-list-item>
					                        <v-card-actions class="ml-5">
					                            <v-btn icon small @click="editCategory(index)">
					                                <v-icon color="green" >edit</v-icon>
					                            </v-btn>
					                            <v-btn icon small class="ml-5" @click="deleteCategory(category.slug, index)">
					                                <v-icon color="red">delete</v-icon>
					                            </v-btn>
					                        </v-card-actions>

					                        <v-list-item-content>
					                            <v-list-item-title class="ml-5">
					                                {{category.name}}<br><br>
					                            </v-list-item-title>
					                        </v-list-item-content>
					                    </v-list-item>

					                     <v-divider></v-divider>
					                </div>
					            </v-list>  
					        </v-card>
					    </v-container>
					</template>

					<script>
					    export default {
					        name: "Category",

					        data(){
					            return {
					                categoryForm: {
					                    name: null,
					                },
					                categories: {},
					                errors: null,
					                hasSlug: null
					            }
					        },

					        created() {
					            axios.get('api/categories')
					                .then(res => this.categories = res.data.data)
					                .catch(error => error.response.data)
					        },

					        methods:{
					            submitCategory() {
					                this.hasSlug ? this.updateCategory() : this.createCategory()
					            },

					            createCategory() {
					                axios.post('/api/categories', this.categoryForm)
					                    .then(res => {
					                        this.categories.unshift(res.data.category)
					                        this.categoryForm.name = null
					                    })
					                    .catch(error => this.errors = error.response.data.errors)
					            },

					            updateCategory() {
					                axios.put(`/api/categories/${this.hasSlug}`, this.categoryForm)
					                    .then(res => {
					                        this.categories.unshift(res.data)
					                        this.categoryForm.name = null
					                        this.hasSlug = null
					                    })
					                    .catch(error => this.errors = error.response.data.error)
					            },

					            deleteCategory(slug, index) {
					                axios.delete(`/api/categories/${slug}`) 
					                    .then(res => this.categories.splice(index, 1))
					                    .catch(error => console.log(error))
					            },

					            editCategory(index) {
					                this.categoryForm.name = this.categories[index].name
					                this.hasSlug = this.categories[index].slug
					                this.categories.splice(index, 1)
					            }
					        }

					    }
					</script>

					<style>

					</style>



22) Notification Sound
	[22.1] Edit new playSound() in the Notification component
		#resources->js->components->Notification.vue
			<template>
			    <div class="text-center">
			        <v-menu offset-y>
			            <template v-slot:activator="{ on }">
			                <v-btn icon v-on="on">
			                    <v-icon :color="color">add_alert</v-icon>
			                </v-btn>
			                {{unreadCount}}
			            </template>

			            <v-list>
			                <v-list-item v-for="item in unread" :key="item.id">
			                    <router-link :to="item.path">
			                        <v-list-item-title @click="markRead(item)">{{item.question}}</v-list-item-title>
			                    </router-link>
			                </v-list-item>
			            </v-list>

			            <v-divider></v-divider>

			            <v-list>
			                <v-list-item v-for="item in read" :key="item.id">
			                    {{item.question}}
			                </v-list-item>
			            </v-list>

			        </v-menu>
			    </div>
			</template>

			<script>
			    import axios from 'axios';
			    require('howler');


			    export default {
			        name: "Notifications",

			        data() {
			            return {
			                read: {},
			                unread: {},
			                unreadCount: 0,
			                sound: "http://soundbible.com/mp3/railroad_crossing_bell-Brylon_Terry-1551570865.mp3"
			            }
			        },

			        computed: {
			            color() {
			                return this.unreadCount > 0 ? 'red' : 'gray';
			            }
			        },

			        created() {
			            if(User.loggedIn()) {
			                this.getNotifications()
			            }

			            Echo.private('App.User.' + User.id())
			                .notification((notification) => {
			                    this.playSound()
			                    this.unread.unshift(notification)
			                    this.unreadCount ++
			                    //console.log(notification.type)
			                });
			        },

			        methods: {
			            getNotifications() {
			                axios.post('/api/notifications')
			                    .then(res => {
			                        this.read = res.data.read
			                        this.unread = res.data.unread
			                        this.unreadCount = res.data.unread.length
			                    })
			                    .catch(error => Exception.handle(error))
			            },

			            markRead(notification) {
			                axios.post('/api/markasread', {id: notification.id})
			                    .then(res => {
			                        this.unread.splice(notification, 1)
			                        this.read.push(notification)
			                        this.unreadCount --
			                    })
			            },

			            playSound() {
			                let alert = new Audio(this.sound)
			                alert.play()
			            },
			        }
			    }
			</script>

			<style>

			</style>




23) Add Pagination on Questions
	[23.1] Add pagination functioon in the QuestionController
		#Replace get() with paginate() in index()
			#app->Http->Controllers->QuestionController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Database\Eloquent\Model;
				use App\Model\Question;
				use Illuminate\Http\Request;
				use App\Http\Resources\QuestionResource;
				use Illuminate\Support\Str;
				use App\Http\Requests\QuestionRequest;


				class QuestionController extends Controller
				{
				    /**
				     * Create a new AuthController instance.
				     *
				     * @return void
				     */
				    public function __construct()
				    {
						$this->middleware('JWT', ['except' => ['index', 'show']]);
				    }

				    /**
				     * Display a listing of the resource.
				     *
				     * @return \Illuminate\Http\Response
				     */
				    public function index()
				    {
				        return QuestionResource::collection(Question::latest()->paginate(5));
				    }

				    /**
				     * Store a newly created resource in storage.
				     *
				     * @param  \Illuminate\Http\Request  $request
				     * @return \Illuminate\Http\Response
				     */
				    public function store(QuestionRequest $request)
				    {
				        $request['slug'] = Str::slug($request->title);
				        $question = auth()->user()->questions()->create($request->all()); 
				         
				        return response(new QuestionResource($question), 201);
				    }

				    /**
				     * Display the specified resource.
				     *
				     * @param  \App\Model\Question  $question
				     * @return \Illuminate\Http\Response
				     */
				    public function show(Question $question)
				    {
				        return new QuestionResource($question);
				    }

				    /**
				     * Update the specified resource in storage.
				     *
				     * @param  \Illuminate\Http\Request  $request
				     * @param  \App\Model\Question  $question
				     * @return \Illuminate\Http\Response
				     */
				    public function update(Request $request, Question $question)
				    {
				        $question->update($request->all());
				        return response('Updated', 202);
				    }

				    /**
				     * Remove the specified resource from storage.
				     *
				     * @param  \App\Model\Question  $question
				     * @return \Illuminate\Http\Response
				     */
				    public function destroy(Question $question)
				    {
				        $question->delete();
				        return response('Deleted', 201);
				    }
				}

	[23.2] Display it and make it work on Frontend
		#Add pagination Vuetify component and display the correct number of pages
			#resources->js->components->forum.vue
				<template>
				    <v-container fluid grid-list-md>
				        <v-layout row wrap>
				            <v-flex xs8>
				                <Questions v-for="question in questions" :key="question.path" :question = question>
				                        
				                </Questions>
				            </v-flex>

				            <div class="text-center">
				                <v-pagination
				                    v-model="page"
				                    class="my-4"
				                    :length="pages.total"
				                    >
				                </v-pagination>     
				            </div>

				            <v-flex xs4>
				                <Sidebar>
				                        
				                </Sidebar>
				            </v-flex>
				        </v-layout>
				    </v-container>
				</template>

				<script>
				    import Questions from "./Questions"
				    import Sidebar from "./Sidebar"

				    export default {
				        name: "Forum",

				        components: {Questions, Sidebar},

				        data() {
				            return {
				                questions: {},
				                pages: {}
				            }
				        },

				        created(){
				            axios.get('/api/questions')
				                .then(res => {
				                    this.questions = res.data.data
				                    this.pages = res.data.meta
				                })
				                .catch(error => console.log(error.response.data))
				        }
				    }
				</script>

				<style>

				</style>

		#Change the pages using links
			#resources->js->components->forum.vue
				<template>
				    <v-container fluid grid-list-md>
				        <v-layout row wrap>
				            <v-flex xs8>
				                <Questions v-for="question in questions" :key="question.path" :question = question>
				                        
				                </Questions>
				            </v-flex>

				            <div class="text-center">
				                <v-pagination
				                    v-model="pages.current_page"
				                    class="my-4"
				                    :length="pages.last_page"
				                    @input="changePage"
				                    >
				                </v-pagination>     
				            </div>

				            <v-flex xs4>
				                <Sidebar>
				                        
				                </Sidebar>
				            </v-flex>
				        </v-layout>
				    </v-container>
				</template>

				<script>
				    import Questions from "./Questions"
				    import Sidebar from "./Sidebar"

				    export default {
				        name: "Forum",

				        components: {Questions, Sidebar},

				        data() {
				            return {
				                questions: {},
				                pages: {}
				            }
				        },

				        created(){
				            this.getQuestions()
				        },

				        methods: {
				            getQuestions() {
				                axios.get('/api/questions')
				                .then(res => {
				                    this.questions = res.data.data
				                    this.pages = res.data.meta
				                })
				                .catch(error => console.log(error.response.data))
				            },

				            changePage() {
				                axios.get(`/api/questions?page=${this.pages.current_page}`)
				                    .then(res => {
				                        this.questions = res.data.data
				                        this.pages = res.data.meta
				                    })
				                    .catch(error => console.log(error.response.data))
				            }
				        }
				    }
				</script>

				<style>

				</style>

		#Make it more efficient by avoiding repeatation
			#resources->js->components->forum.vue
				<template>
				    <v-container fluid grid-list-md>
				        <v-layout row wrap>
				            <v-flex xs8>
				                <Questions v-for="question in questions" :key="question.path" :question = question>
				                        
				                </Questions>
				            </v-flex>

				            <div class="text-center">
				                <v-pagination
				                    v-model="pages.current_page"
				                    class="my-4"
				                    :length="pages.last_page"
				                    @input="changePage"
				                    >
				                </v-pagination>     
				            </div>

				            <v-flex xs4>
				                <Sidebar>
				                        
				                </Sidebar>
				            </v-flex>
				        </v-layout>
				    </v-container>
				</template>

				<script>
				    import Questions from "./Questions"
				    import Sidebar from "./Sidebar"

				    export default {
				        name: "Forum",

				        components: {Questions, Sidebar},

				        data() {
				            return {
				                questions: {},
				                pages: {}
				            }
				        },

				        created(){
				            this.getQuestions()
				        },

				        methods: {
				            getQuestions(page) {
				                let url = page ? `api/questions?page=${this.pages.current_page}` : '/api/questions'
				                
				                axios.get(url)
				                    .then(res => {
				                        this.questions = res.data.data
				                        this.pages = res.data.meta
				                    })
				                    .catch(error => console.log(error.response.data))
				            },

				            changePage(page) {
				                this.getQuestions(page)
				            }
				        }
				    }
				</script>

				<style>

				</style>














		











		
















		





































				

























		














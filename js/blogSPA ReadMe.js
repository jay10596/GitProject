1) Create a project
	laravel new blogSPA



2) Add Git repository
	[2.1] Cretae a repo on Git

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



3) Setup mysql database
	[3.1] Open mysql and create the database
		#From the project's directory/VS code's terminal 	
			mysql

			create database bootcamp4;

			#OR

		#From root directory/Mac terminal
			mysql -u root

			create database bootcamp4;

	[3.2] TablePlus -> Create a new connection -> MySQL -> User: root -> Connect
		#Open database bootcamp4

	[3.3] Edit .env file
		DB_DATABASE=bootcamp4

	[3.4] Exit mysql terminal and migrate to check if it works
		exit

		php artisan migrate

	[3.5] Refresh TablePlus to check if it works



4) Add JWT
	[4.1] Go to: https://github.com/tymondesigns/jwt-auth and grab latest Tag

	[4.2] Composer.json
		"require": {
			....
			"tymon/jwt-auth": "1.0.0"
		}

		composer update

	[4.3] Go to the documentation section and follow the steps
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
				#app->User
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


					    public function getJWTIdentifier()
					    {
					        return $this->getKey();
					    }

					    public function getJWTCustomClaims()
					    {
					        return [];
					    }
					}

			#Configure Auth guard
				#config->auth.php
					'defaults' => [
					    'guard' => 'api',
					    'passwords' => 'users',
					],

					...

					'guards' => [
						...
						
					    'api' => [
					        'driver' => 'jwt',
					        'provider' => 'users',
					    ],
					],

			#Add basic authentication routes in api
				//Copy from the Docs, add singup route mannually
				#routes->api.php
					Route::group([

					    'middleware' => 'api',
					    'prefix' => 'auth'

					], function ($router) {

					    Route::post('login', 'AuthController@login');
					    Route::post('signup', 'AuthController@signup');
					    Route::post('logout', 'AuthController@logout');
					    Route::post('refresh', 'AuthController@refresh');
					    Route::post('me', 'AuthController@me');

					});

			#Create the AuthController
				php artisan make:controller AuthController

				#app->Http->Controllers->AuthController
					(Copy from the documentation) 
					//Validate login(), make signup() and add username in respondWithToken()
					<?php

					namespace App\Http\Controllers;

					use Illuminate\Support\Facades\Auth;
					use App\Http\Controllers\Controller;
					use Illuminate\Http\Request;
					use App\Http\Requests\UserRequest;

					use App\User;

					class AuthController extends Controller
					{
					    public function __construct()
					    {
					        $this->middleware('JWT', ['except' => ['login', 'signup']]);
					    }

					    public function login(Request $request)
					    {
					        $credentials = request()->validate(['email' => 'required', 'password' => 'required']);

					        if (! $token = auth()->attempt($credentials)) {
					            return response()->json(['error' => 'Unauthorized'], 401);
					        }

					        return $this->respondWithToken($token);
					    }

					    public function signup(UserRequest $request)
					    {
					        User::create($request->all());
					        return $this->login($request);
					    }

					    public function me()
					    {
					        return response()->json(auth()->user());
					    }

					    public function logout()
					    {
					        auth()->logout();

					        return response()->json(['message' => 'Successfully logged out']);
					    }

					    public function refresh()
					    {
					        return $this->respondWithToken(auth()->refresh());
					    }

					    protected function respondWithToken($token)
					    {
					        return response()->json([
					            'access_token' => $token,
					            'token_type' => 'bearer',
					            'expires_in' => auth()->factory()->getTTL() * 60,
					            'user' => auth()->user()->name
					        ]);
					    }
					}

				#Add password as bycrypt
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



3) Complete backend CRUD
	[3.1] Create Migration, ResourceController and Factory in one command
		php artisan make:controller UserController -r

		php artisan make:model Question -mfr

		php artisan make:model Reply -mfr

		php artisan make:model Category -mfr

		php artisan make:model Like -mfr

		php artisan make:model Favourite -mfr

		php artisan make:controller ImageController

		php artisan make:controller CountController

	[3.2] Add values in Migration
		#user
			Schema::create('users', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->timestamp('birthday');
	            $table->string('email')->unique();
	            $table->timestamp('email_verified_at')->nullable();
	            $table->string('password');
	            $table->longText('avatar')->nullable();
	            $table->rememberToken();
	            $table->timestamps();
	        });

		#questions
			Schema::create('questions', function (Blueprint $table) {
	            $table->id();
	            $table->string('title');
	            $table->string('slug');
	            $table->text('body');
	            $table->unsignedBigInteger('category_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

        #likes
	        Schema::create('likes', function (Blueprint $table) {
	            $table->id();
	            $table->unsignedBigInteger('reply_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('reply_id')->references('id')->on('replies')->onDelete('cascade');
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #Factory
	    	Schema::create('favourites', function (Blueprint $table) {
	            $table->id();
	            $table->unsignedBigInteger('question_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	[3.3] Add relationship in Models
		#user
			<?php

			namespace App;

			use Illuminate\Contracts\Auth\MustVerifyEmail;
			use Illuminate\Foundation\Auth\User as Authenticatable;
			use Illuminate\Notifications\Notifiable;
			use Tymon\JWTAuth\Contracts\JWTSubject;

			use App\Question;
			use App\Reply;
			use Carbon\Carbon;

			class User extends Authenticatable implements JWTSubject
			{
			    use Notifiable;


			    protected $fillable = [
			        'name', 'email', 'password', 'birthday', 'avatar'
			    ];

			    protected $hidden = [
			        'password', 'remember_token',
			    ];

			    protected $casts = [
			        'email_verified_at' => 'datetime',
			    ];

			    public function getJWTIdentifier()
			    {
			        return $this->getKey();
			    }

			    public function getJWTCustomClaims()
			    {
			        return [];
			    }

			    public function setPasswordAttribute($value)
			    {
			        $this->attributes['password'] = bcrypt($value);
			    }

			    protected $dates = ['birthday'];

			    public function setBirthdayAttribute($birthday)
			    {
			        $this->attributes['birthday'] = Carbon::parse($birthday);
			    }

			    protected $with = ['questions'];

			    public function questions()
			    {
			        return $this->hasMany(Question::class);
			    }

			    public function replies()
			    {
			        return $this->hasMany(Reply::class);
			    }
			}

		#Question
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\User;
			use App\Reply;
			use App\Category;
			use App\Favourite;


			class Question extends Model
			{
			    //protected $guarded = []; //$Not suitable for $request->all()

			    protected $fillable = ['title', 'slug', 'body', 'category_id', 'user_id'];

			    public function getRouteKeyName()
			    {
			        return 'slug';
			    }

			    public function getPathAttribute()
			    {
			        return "/questions/$this->slug";
			    }
			    
			    protected $with = ['replies', 'category'];

			    public function user()
			    {
			        return $this->belongsTo(User::class);
			    }

			    public function replies()
			    {
			        return $this->hasMany(Reply::class)->latest();
			    }

			    public function category()
			    {
			        return $this->belongsTo(Category::class);
			    }

			    public function favourites()
			    {
			        return $this->hasMany(Favourite::class);
			    }
			}

		#Reply
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\User;
			use App\Question;
			use App\Like;

			class Reply extends Model
			{
				protected $guarded = [];

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
			}

		#Category
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;
			use App\Question;

			class Category extends Model
			{
				protected $guarded = [];

				public function getRouteKeyName()
			    {
			        return 'slug';
			    }

			    public function questions()
			    {
			        return $this->hasMany(Question::class);
			    }
			}

		#Like
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Like extends Model
			{
			    protected $guarded = [];
			}

		#Favourite
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Favourite extends Model
			{
			    protected $guarded = [];
			}

	[3.4] Edit Factories
		#UserFactory
			use App\User;
			use Faker\Generator as Faker;
			use Illuminate\Support\Str;


			$factory->define(User::class, function (Faker $faker) {
			    return [
			        'name' => $faker->name,
			        'birthday' => $faker->dateTimeBetween('1990-01-01', '2012-12-31')
			        ->format('d-m-Y'),
			        'email' => $faker->unique()->safeEmail,
			        'email_verified_at' => now(),
			        'password' => 'password',
			        'remember_token' => Str::random(10),
			    ];
			});

		#QuestionFactory
			use App\Question;
			use App\Category;
			use App\User;
			use Faker\Generator as Faker;
			use Illuminate\Support\Str;


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
			use App\Category;
			use Faker\Generator as Faker;
			use Illuminate\Support\Str;


			$factory->define(Category::class, function (Faker $faker) {
			    $word = $faker->word;

			    return [
			        'name' => $word,
			        'slug' => Str::slug($word)
			    ];
			});

		#LikeFactory
			use App\Like;
			use App\User;
			use Faker\Generator as Faker;


			$factory->define(Like::class, function (Faker $faker) {
			    return [
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#FavouriteFactory
			use App\Favourite;
			use App\Question;
			use App\User;
			use Faker\Generator as Faker;

			$factory->define(Favourite::class, function (Faker $faker) {
			    return [
			        'question_id' => $faker->unique()->numberBetween(1,10),
			        'user_id' => $faker->numberBetween(1,10)
			    ];
			}); //Can be done just like LikeFactory.This is just another way


	[3.5] Modify DatabaseSeeder
		<?php

		use Illuminate\Database\Seeder;

		use App\User;
		use App\Category;
		use App\Question;
		use App\Reply;
		use App\Like;
		use App\Favourite;


		class DatabaseSeeder extends Seeder
		{
		    
		    public function run()
		    {
		        factory(User::class, 10)->create();
		        factory(Category::class, 5)->create();
		        factory(Question::class, 10)->create();
		        factory(Reply::class, 50)->create()->each(function($reply){
		            return $reply->likes()->save(factory(Like::class)->make());
		        });; //LikeFactory contains only user_id as reply_id will be created though relationship
		        factory(Favourite::class, 10)->create(); //Both question_id and user_id are created in the factory the normal way
		    }
		}

	[3.6] Make api routes
		<?php

		use Illuminate\Http\Request;
		use Illuminate\Support\Facades\Route;

		Route::middleware('auth:api')->get('/user', function (Request $request) {
		    return $request->user();
		});

		Route::group([

		    'middleware' => 'api',
		    'prefix' => 'auth'

		], function ($router) {

		    Route::post('login', 'AuthController@login');
		    Route::post('signup', 'AuthController@signup');
		    Route::post('logout', 'AuthController@logout');
		    Route::post('refresh', 'AuthController@refresh');
		    Route::post('me', 'AuthController@me');

		});

		//CRUD
		Route::apiResource('/users', 'UserController');

		Route::apiResource('/questions', 'QuestionController');

		Route::apiResource('/categories', 'CategoryController');

		Route::apiResource('/questions/{question}/replies', 'ReplyController');


		//LIKE
		Route::post('/replies/{reply}/like', 'LikeController@likeIt');
		Route::delete('/replies/{reply}/like', 'LikeController@unlikeIt');


		//FAVOURITE
		Route::get('/favourites', 'FavouriteController@getQuestions');
		Route::post('/questions/{question}/favourite', 'FavouriteController@favouriteIt');
		Route::delete('/questions/{question}/favourite', 'FavouriteController@unfavouriteIt');


		//SEARCH
		Route::post('/search', 'SearchController@getUsers');


		//NOTIFICATIONS
		Route::post('/notifications', 'NotificationController@index');
		Route::post('/markasread', 'NotificationController@markAsRead');


		//COUNT
		Route::post('/maximumreplies', 'CountController@maxReplies');
		Route::post('/maximumquestions', 'CountController@maxQuestions');
		Route::post('/thismonthquestions', 'CountController@thisMonthQuestions');


	[3.7] Make Requests
		#UserRequest
			php artisan make:request UserRequest

			#app->Http->Requests->UserRequest
				namespace App\Http\Requests;

				use Illuminate\Foundation\Http\FormRequest;

				class UserRequest extends FormRequest
				{

				    public function authorize()
				    {
				        return true;
				    }

				    public function rules()
				    {
				        return [
				            'name' => 'required',
				            'birthday' => 'required',
				            'email' => 'required | email',
				            'password' => 'required',
				        ];
				    }
				}

		#QuestionRequest
			php artisan make:request QuestionRequest

			#app->Http->Requests->QuestionRequest
				namespace App\Http\Requests;

				use Illuminate\Foundation\Http\FormRequest;

				class QuestionRequest extends FormRequest
				{
				    public function authorize()
				    {
				        return true;
				    }

				    public function rules()
				    {
				        return [
				            'title' => 'required',
				            'body' => 'required',
				            'category_id' => 'required'
				        ];
				    }
				}

		#CategoryRequest
			php artisan make:request CategoryRequest

			#app->Http->Requests->CategoryRequest
				namespace App\Http\Requests;

				use Illuminate\Foundation\Http\FormRequest;

				class CategoryRequest extends FormRequest
				{

				    public function authorize()
				    {
				        return true;
				    }

				    public function rules()
				    {
				        return [
				            'name' => 'required'
				        ];
				    }
				}

	[3.8] Make Resources
		#UserResource
			php artisan make:resource UserResource

			public function toArray($request)
		    {
		        return [
		            'id' => $this->id,
		            'name' => $this->name,
		            'birthday' => $this->birthday->format('m/d/Y'),
		            'email' => $this->email,
		            'avatar' => $this->avatar,
		            'questions' => QuestionResource::collection($this->questions)
		        ];
		    }

		#QuestionResource
			php artisan make:resource QuestionResource

			public function toArray($request)
		    {
		        return [
		            'id' => $this->id,
		            'title' => $this->title,
		            'slug' => $this->slug,
		            'path' => $this->path,
		            'body' => $this->body,
		            'created_at' => $this->created_at->diffForHumans(),

		            'favourite_count' => $this->favourites->count(),
		            'favourited' => !! $this->favourites->where('user_id', auth()->id())->count(),
		            
		            'user_id' => $this->user_id,
		            'user_name' => $this->user->name,
		            'user_avatar' => $this->user->avatar,

		            'category' => new CategoryResource($this->category),
		            
		            'replies' => ReplyResource::collection($this->replies)
		        ];
		    }

		#CategoryResource //Can alos return questions => $this->questions by adding with[questions] parameter in the Category model but this is justa  different way
			php artisan make:resource CategoryResource

			public function toArray($request)
		    {
		        return [
		            'id' => $this->id,
		            'name' => $this->name,
		            'slug' => $this->slug,
		        ];
		    }

		#ReplyResource
			php artisan make:resource ReplyResource

		    public function toArray($request)
		    {
		        return [
		            'id' => $this->id,
		            'body' => $this->body,

		            'question_id' => $this->question->id,

		            'user_id' => $this->user_id,
		            'user_name' => $this->user->name,
		            'user_avatar' => $this->user->avatar,
		            
		            'like_count' => $this->likes->count(),
		            'liked' => !! $this->likes->where('user_id', auth()->id())->count(),
		            
		            'created_at' => $this->created_at->diffForHumans(),
		        ];
		    }

	[3.9] Modify Controllers
		#UserController
			namespace App\Http\Controllers;

			use Illuminate\Http\Request;
			use App\User;
			use App\Http\Requests\UserRequest;
			use App\Http\Resources\UserResource;


			class UserController extends Controller
			{

				public function __construct()
			    {
			        $this->middleware('JWT', ['except' => ['index', 'show']]);
			    }

			    public function index()
			    {
			        return User::latest()->get();
			    }
			    	/*Postman
						Get->http://127.0.0.1:8000/api/users */

			    public function show(User $user)
			    {
			        return new UserResource($user);
			    }
			    	/*Postman
						Get->http://127.0.0.1:8000/api/users/1 */

			    public function update(UserRequest $request, User $user)
			    {
			        $user->update($request->all());

			        return (new UserResource($user))->response()->setStatusCode(202);
			    }
			    	/*Postman
		    			Put->http://127.0.0.1:8000/api/users/1
							Header:
								Accept: application/json
								Content-Type: application/json
							Body: (select x-www-form-urluncoded instead of form-data)
								name: New Name
								email: email@test.com
							Authorization: Provide copied token from login */

			    public function destroy(User $user)
			    {
			        auth()->user()->delete();

			        return response('Deleted', 204);
			    }
			    	/*Delete->http://127.0.0.1:8000/api/users/1
						Authorization: Provide copied token from login */ 
			}

		#QuestionController
			<?php

			namespace App\Http\Controllers;

			use App\Question;
			use Illuminate\Http\Request;
			use Illuminate\Support\Str;
			use App\Http\Resources\QuestionResource;
			use App\Http\Requests\QuestionRequest;


			class QuestionController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('JWT', ['except' => ['index', 'show']]);
			    }
			                
			    public function index()
			    {
			        return QuestionResource::collection(Question::latest()->get());
			    }

			    public function store(QuestionRequest $request)
			    {
			        $request['slug'] = Str::slug($request->title);

			        $question = auth()->user()->questions()->create($request->all()); 

			        /*$question = Question::create([
			            'title' => $request->title,
			            'slug' => Str::slug($request->title),
			            'body' => $request->body,
			            'category_id' => $request->category_id,
			            'user_id' => auth()->user()->id
			        ]);*/

			        return (new QuestionResource($question))->response()->setStatusCode(201);
			    }

			    public function show(Question $question)
			    {
			        return new QuestionResource($question);
			    }

			    public function update(QuestionRequest $request, Question $question)
			    {
			        $request['slug'] = Str::slug($request->title);

			        $question->update($request->all()); //To use request->all(), in the model, add proteced protected $fillable =[title,body...].

			        /*$question->update(
			            [
			                'title' => $request->title,
			                'slug' => Str::slug($request->title),
			                'body' => $request->body,
			                'category_id' => $request->category_id,
			            ]
			        );*/ //For this method, in model, only protected $guarded=[] is fine.

			        return (new QuestionResource($question))->response()->setStatusCode(202);
			    }

			    public function destroy(Question $question)
			    {
			        $question->delete();

					return response('deleted', 204);
			    }
			}

		#CategoryController //Add only name in the postman to store and update
			<?php

			namespace App\Http\Controllers;

			use App\Category;
			use Illuminate\Http\Request;
			use Illuminate\Support\Str;
			use App\Http\Resources\CategoryResource;
			use App\Http\Requests\CategoryRequest;

			use App\Question;
			use App\Http\Resources\QuestionResource;


			class CategoryController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('JWT', ['except' => ['index', 'show']]);
			    }

			    public function index()
			    {
			        return CategoryResource::collection(Category::latest()->get());
			    }

			    public function store(CategoryRequest $request)
			    {
			        $request['slug'] = Str::slug($request->name);
			        
			        $category = Category::create($request->all());

			        return (new CategoryResource($category))->response()->setStatusCode(201); /*It will wrap the content in data: {}

			        return response(new CategoryResource($category), 201); it will display content directly because of response()*/
			    }

			    public function show(Category $category) //Can also return (Categoryresource::collection($questions)... directly by adding with[questions] in category model but this is just another way 
			    {
			        $questions = Question::where('category_id', $category->id)->get();

			        return (QuestionResource::collection($questions))->response()->setStatusCode(200);
			    }

			    public function update(CategoryRequest $request, Category $category)
			    {
			        $category->update([
			            'name' => $request->name,
			            'slug' => Str::slug($request->name),
			        ]);

			        return (new CategoryResource($category))->response()->setStatusCode(202);
			    }

			    public function destroy(Category $category)
			    {
			        $category->delete();

				    return response('Deleted', 204);
			    }
			}

		#ReplyController
			use App\Model\Question;
			use App\Http\Resources\ReplyResource;

			public function index(Question $question)
		    {
		        return ReplyResource::collection($question->replies);
		    }
			    /*Postman
					Get->http://127.0.0.1:8000/api/questions/omnis-tempora-in-ut-autem/replies */

			public function show(Question $question, Reply $reply)
		    {
		    	//
		    }

			public function store(Question $question, Request $request)
		    {
		        $request['user_id'] = auth()->user()->id;

		        $reply = $question->replies()->create($request->all());

		        return (new ReplyResource($reply))->response()->setStatusCode(201);
		    }
				/*Postman
					Post->http://127.0.0.1:8000/api/questions/omnis-tempora-in-ut-autem/replies
						Header:
							Accept: application/json
							Content-Type: application/json
						Body:
							body: this is reply
						Authorization:
							Provide copied token from login */

			public function update(Question $question, Request $request, Reply $reply)
		    {
		        $reply->update($request->all());
		        
		        return (new ReplyResource($reply))->response()->setStatusCode(202);
		    }
				/*Postman
					Put->http://127.0.0.1:8000/api/questions/omnis-tempora-in-ut-autem/replies/9
						Header:
							Accept: application/json
							Content-Type: application/json
						Body: (select x-www-form-urluncoded instead of form-data)
							body: This is Tianna, Bitch! */

			public function destroy(Question $question,Reply $reply)
		    {
		        $reply->delete();
		        
		        return response('Deleted', 204);
		    }
			    /*Postman
					Delete->http://127.0.0.1:8000/api/questions/omnis-tempora-in-ut-autem/replies/9 */

		#LikeController
			namespace App\Http\Controllers;

			use App\Like;
			use App\Reply;
			use Illuminate\Http\Request;


			class LikeController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('JWT');
			    }
			    
			    public function likeIt(Reply $reply)
			    {
			        $reply->likes()->create([ 
			            'user_id' => auth()-> id(),
			        ]);
			    }

			    public function unlikeIt(Reply $reply)
			    {
			        $reply->likes()->where('user_id', auth()->id())->first()->delete();
			    }

			    /*public function getReplies(Reply $reply)
			    {
			        $likedRepliesID = Like::where('user_id', auth()->id())->pluck('reply_id');
			        $replies = Reply::find($likedRepliesID);

			        return $replies;
			    }*/ //Not useful for this project
			}

		#FavouriteController
			namespace App\Http\Controllers;

			use App\Favourite;
			use App\Question;
			use Illuminate\Http\Request;
			use App\Http\Resources\QuestionResource;


			class FavouriteController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('JWT');
			    }

			    public function getQuestions()
			    {
			        $likedQuestionsID = Favourite::where('user_id', auth()->id())->pluck('question_id');
			        $questions = Question::find($likedQuestionsID);

			        return QuestionResource::collection($questions);
			    }
			    
			    public function favouriteIt(Question $question)
			    {
			        $question->favourites()->create([ 
			            'user_id' => auth()-> id(),
			        ]);
			    }

			    public function unfavouriteIt(Question $question)
			    {
			        $question->favourites()->where('user_id', auth()->id())->first()->delete();
			    }
			}

		#CountController
			<?php

			namespace App\Http\Controllers;

			use Illuminate\Http\Request;
			use Illuminate\Support\Facades\DB;
			use App\Http\Resources\QuestionResource;
			use App\Http\Resources\ReplyResource;

			use App\Category;
			use App\Question;
			use App\Reply;

			class CountController extends Controller
			{
			    public function maxReplies(Request $request) 
			    {
			        $slug = $request->slug;

			        $question = Question::where('slug', $slug)->get();
			        
			        return ReplyResource::collection($question[0]->replies)->groupBy('user_id');
			    }

			    public function maxQuestions(Request $request)
			    {
			        $slug = $request->slug;

			        $category = Category::where('slug', $slug)->get();
			        
			        return QuestionResource::collection($category[0]->questions)->groupBy('user_id');
			    }

			    public function thisMonthQuestions(Request $request) 
			    {
			        return QuestionResource::collection(Question::whereRaw('created_at like "%-' . now()->format('m') . '-%"')->paginate(5)); //Or use get();
			    }
			}



4) JWT mannual Middleware for better Exception handling
	[4.1] Mannual Middleware
		php artisan make:middleware JWT

		#Modify handle() in JWT middleware
			#app->Http->Middleware->JWT
				use Tymon\JWTAuth\Facades\JWTAuth;

				public function handle($request, Closure $next)
			    {
			        JWTAuth::parseToken()->authenticate();
			        return $next($request);
			    }

		#Register this middleware in Kernel
			#app->Http->Kernal
				protected $routeMiddleware = [
			        ...
			        'JWT' => \App\Http\Middleware\JWT::class,
			    ];

	[4.2] Use the middleware in all the controllers		
			#AuthController
				public function __construct()
			    {
			        $this->middleware('JWT', ['except' => ['login', 'signup']]);
			    }

			#QuestionController
				public function __construct()
			    {
					$this->middleware('JWT', ['except' => ['index', 'show']]);
			    }

				/*#Postman
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

					#Output: All the questions */

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

	[4.3] Exception Handling
		#Edit render() to handle exception
			#app->Exceptions->Handler.php
				<?php

				namespace App\Exceptions;

				use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
				use Throwable;

				use Tymon\JWTAuth\Exceptions\JWTException;
				use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
				use Tymon\JWTAuth\Exceptions\TokenInvalidException;
				use Tymon\JWTAuth\Exceptions\TokenExpiredException;

				class Handler extends ExceptionHandler
				{
				    protected $dontReport = [
				        //
				    ];

				    protected $dontFlash = [
				        'password',
				        'password_confirmation',
				    ];

				    public function report(Throwable $exception)
				    {
				        parent::report($exception);
				    }

				    public function render($request, Throwable $exception)
				    {
				        if($exception instanceof TokenBlacklistedException)
				        {
				            return response(['error'=>"Token is blacklisted"], 500);
				        }
				        else if($exception instanceof TokenInvalidException)
				        {
				            return response(['error'=>"Token is invalid"], 500);
				        }
				        else if($exception instanceof TokenExpiredException)
				        {
				            return response(['error'=>"Token is expired"], 500);
				        }
				        else if($exception instanceof JWTException)
				        {
				            return response(['error'=>"Token is not provided"], 500);
				        }
				        return parent::render($request, $exception);
				    }
				}



5) Perform testing
	[5.1] Setup tetsing enviornment
		#Make sure connection is set to sqlite
			#phpunit.xml
				<server name="DB_CONNECTION" value="sqlite"/>
        		<server name="DB_DATABASE" value=":memory:"/>

        	#Modify the command to avoid writing the whole command
        		alias pu="clear && vendor/bin/phpunit"  
        		alias pf="clear && vendor/bin/phpunit --filter" 

    [5.2] Testing for questions
    	php artisan make:test QuestionTest 

    	#tests->Feature->QuestionTest
    		<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;
			use JWTAuth;
			use Tymon\JWTAuth\Exceptions\JWTException;

			use App\User;
			use App\Question;
			use App\Category;
			use Carbon\Carbon;


			class QuestionTest extends TestCase
			{

			    use RefreshDatabase;

			    protected $user;
			    protected $token;
			    protected $server;

			    protected $category;
			    protected $question;

			    protected function setUp(): void 
			    {
			        parent::setUp();

			        $this->user = factory(User::class)->create();

			        $this->token = JWTAuth::fromUser($this->user);

			        $this->server = [
			            'HTTP_Authorization' => 'Bearer '. $this->token
			        ];


			        $this->category = factory(Category::class)->create();

			        $this->question = factory(Question::class)->create(['user_id' => $this->user->id, 'category_id' => $this->category->id]);
			    }

			    private function data()
			    {
			        return [
			            'title' => 'Test Question',
			            'body' => 'This is a new question.',
			            'category_id' => 1
			        ];
			    }

			    /** @test */
			    public function auth_user_can_create_question()
			    {
			        $response = $this->post('/api/questions', $this->data(), $this->server);

			        $response->assertStatus(201);

			        $this->assertCount(2, Question::all());


			        $questions = Question::all();
			        $question = $questions[1];

			        $this->assertEquals('Test Question', $question->title);
			        $this->assertEquals('This is a new question.', $question->body);
			        $this->assertEquals(1, $question->category_id);
			    
			    
			        $response->assertJson([
			            'data' => [
			                'title' => $question->title,
			                'path' => $question->path,
			                'body' => $question->body,
			                'created_at' => $question->created_at->diffForHumans(),
			                'user_name' => $question->user->name,
			            ],
			        ]);
			    }

			    /** @test */
			    public function unauth_user_cannot_create_question()
			    {
			        $response = $this->post('/api/questions', $this->data(), array_merge($this->server, ['HTTP_Authorization' => '']));

			        $response->assertStatus(500);

			        $this->assertCount(1, Question::all());
			    }

			    /** @test */
			    public function auth_user_can_update_question()
			    {
			        $response = $this->put('api/questions/' . $this->question->slug, $this->data(), $this->server);

			        $response->assertStatus(202);

			        $this->assertCount(1, Question::all());


			        $this->question = $this->question->fresh();

			        $this->assertEquals('Test Question', $this->question->title);
			        $this->assertEquals('This is a new question.', $this->question->body);
			        $this->assertEquals(1, $this->question->category_id);


			        $response->assertJson([
			            'data' => [
			                'title' => $this->question->title,
			                'path' => $this->question->path,
			                'body' => $this->question->body,
			                'created_at' => $this->question->created_at->diffForHumans(),
			                'user_name' => $this->question->user->name,
			            ],
			        ]);
			    }

			    /** @test */
			    public function unauth_user_cannot_update_question()
			    {
			        $response = $this->put('/api/questions' . $this->question->slug, $this->data(), array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(405);
			        
			        $this->assertCount(1, Question::all());

			        $this->assertNotEquals('Test Question', $this->question->title);
			        $this->assertNotEquals('This is a new question.', $this->question->body);
			    }

			    /** @test */
			    public function field_is_required_create_question()
			    {
			        collect(['title', 'body', 'category_id'])->each(function($field) {
			            $response = $this->post('/api/questions', array_merge($this->data(), [$field => '']), $this->server);
			            
			            $response->assertSessionHasErrors($field);

			            $this->assertCount(1, Question::all());
			        });
			    }

			    /** @test */
			    public function field_is_required_update_question()
			    {
			        collect(['title', 'body', 'category_id'])->each(function($field) {
			            $response = $this->put('/api/questions/' . $this->question->slug, array_merge($this->data(), [$field => '']), $this->server);
			            
			            $response->assertSessionHasErrors($field);

			            $this->assertCount(1, Question::all());
			        });
			    }

			    /** @test */
			    public function any_user_show_question()
			    {        
			        $response = $this->get('/api/questions/' . $this->question->slug);
			    
			        $response->assertJson([
			            'data' => [
			                'title' => $this->question->title,
			                'body' => $this->question->body,
			                'created_at' => $this->question->created_at->diffForHumans(),
			                'user_name' => $this->question->user->name,
			            ],
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_delete_question()
			    {
			        $response = $this->delete('api/questions/' . $this->question->slug, array_merge($this->data(), ['title' => '', 'body' => '', 'category_id' => '']), $this->server);

			        $response->assertStatus(204);

			        $this->assertCount(0, Question::all());
			    }

			    /** @test */
			    public function unauth_user_cannot_delete_question()
			    {
			        $response = $this->delete('/api/questions/' . $this->question->slug, array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(500);
			        
			        $this->assertCount(1, Question::all());
			    }
			}

	[5.3] Testing for categories
		php artisan make:test CategoryTest

		#tests->Feature->CategoryTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;
			use JWTAuth;
			use Tymon\JWTAuth\Exceptions\JWTException;

			use App\User;
			use App\Question;
			use App\Category;


			class CategoryTest extends TestCase
			{
			    use RefreshDatabase;

			    protected $admin;
			    protected $token;
			    protected $server;

			    protected $category;

			    protected function setUp(): void 
			    {
			        parent::setUp();

			        $this->admin = factory(User::class)->create();

			        $this->token = JWTAuth::fromUser($this->admin);

			        $this->server = [
			            'HTTP_Authorization' => 'Bearer '. $this->token
			        ];

			        $this->category = factory(Category::class)->create();
			    }

			    private function data()
			    {
			        return [
			            'name' => 'Test Category',
			        ];
			    }

			    /** @test */
			    public function auth_admin_can_create_category()
			    {
			        $response = $this->post('/api/categories', $this->data(), $this->server);

			        $response->assertStatus(201);

			        $this->assertCount(2, Category::all());


			        $categories = Category::all();
			        $category = $categories[1];

			        $this->assertEquals('Test Category', $category->name);
			    

			        $response->assertJson([
			            'data' => [
			                'name' => $category->name,
			                'id' => $category->id
			            ],
			        ]);
			    }

			    /** @test */
			    public function unauth_admin_cannot_create_category()
			    {
			        $response = $this->post('/api/categories', $this->data(), array_merge($this->server, ['HTTP_Authorization' => '']));

			        $response->assertStatus(500);

			        $this->assertCount(1, Category::all());
			    }

			    /** @test */
			    public function auth_admin_can_update_category()
			    {
			        $response = $this->put('api/categories/' . $this->category->slug, $this->data(), $this->server);

			        $response->assertStatus(202);

			        $this->assertCount(1, Category::all());


			        $this->category = $this->category->fresh();

			        $this->assertEquals('Test Category', $this->category->name);


			        $response->assertJson([
			            'data' => [
			                'name' => $this->category->name,
			                'id' => $this->category->id
			            ],
			        ]);
			    }

			    /** @test */
			    public function unauth_admin_cannot_update_category()
			    {
			        $response = $this->put('/api/categories' . $this->category->slug, $this->data(), array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(405);
			        
			        $this->assertCount(1, Category::all());

			        $this->assertNotEquals('Test Category', $this->category->title);
			    }

			    /** @test */
			    public function field_is_required_create_category()
			    {
			        $response = $this->post('/api/categories', array_merge($this->data(), ['name' => '']), $this->server);
			        
			        $response->assertSessionHasErrors('name');

			        $this->assertCount(1, Category::all());
			    }

			    /** @test */
			    public function field_is_required_update_category()
			    {
			        $response = $this->put('/api/categories/' . $this->category->slug, array_merge($this->data(), ['name' => '']), $this->server);
			        
			        $response->assertSessionHasErrors('name');

			        $this->assertCount(1, Category::all());
			    }

			    /** @test */
			    public function any_user_can_see_questions_of_this_category()
			    {        
			        $question = factory(Question::class)->create(['user_id' => $this->admin->id, 'category_id' => $this->category->id]);

			        $response = $this->get('/api/categories/' . $this->category->slug);
			    
			        $response->assertJson([
			            'data' => [
			                [
			                    'title' => $question->title,
			                    'body' => $question->body,
			                    'created_at' => $question->created_at->diffForHumans(),
			                    'user_name' => $question->user->name,
			                ]
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_admin_can_delete_category()
			    {
			        $response = $this->delete('api/categories/' . $this->category->slug, array_merge($this->data(), ['name' => '']), $this->server);

			        $response->assertStatus(204);

			        $this->assertCount(0, Category::all());
			    }

			    /** @test */
			    public function unauth_admin_cannot_delete_category()
			    {
			        $response = $this->delete('/api/categories/' . $this->category->slug, array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(500);
			        
			        $this->assertCount(1, Category::all());
			    }
			    
			}

	[5.4] Testing for replies
		php artisan make:test ReplyTest

		#tests->Feature->ReplyTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;
			use JWTAuth;
			use Tymon\JWTAuth\Exceptions\JWTException;

			use App\User;
			use App\Category;
			use App\Question;
			use App\Reply;

			class ReplyTest extends TestCase
			{
			    use RefreshDatabase;

			    protected $user;
			    protected $token;
			    protected $server;

			    protected $category;
			    protected $question;


			    protected function setUp(): void 
			    {
			        parent::setUp();

			        $this->user = factory(User::class)->create();

			        $this->token = JWTAuth::fromUser($this->user);

			        $this->server = [
			            'HTTP_Authorization' => 'Bearer '. $this->token
			        ];

			        $this->category = factory(Category::class)->create();

			        $this->question = factory(Question::class)->create(['user_id' => $this->user->id, 'category_id' => $this->category->id]);

			        $this->reply = factory(Reply::class)->create(['user_id' => $this->user->id, 'question_id' => $this->question->id]);
			    }

			    private function data()
			    {
			        return [
			            'body' => 'Test Reply',
			        ];
			    }

			    /** @test */
			    public function auth_user_can_create_reply()
			    {
			        $response = $this->post('/api/questions/' . $this->question->slug . '/replies', $this->data(), $this->server);

			        $response->assertStatus(201);

			        $this->assertCount(2, Reply::all());


			        $replies = Reply::all();
			        $reply = $replies[1];

			        $this->assertEquals('Test Reply', $reply->body);
			    

			        $response->assertJson([
			            'data' => [
			                'id' => $reply->id,
			                'body' => $reply->body,
			                'question_id' => $reply->question->id,
			                'user_name' => $reply->user->name,
			                'user_id' => $reply->user_id,
			                'created_at' => $reply->created_at->diffForHumans(),
			            ],
			        ]);
			    }

			    /** @test */
			    public function unauth_user_cannot_create_reply()
			    {
			        $response = $this->post('/api/questions/' . $this->question->slug . '/replies', $this->data(), array_merge($this->server, ['HTTP_Authorization' => '']));

			        $response->assertStatus(500);

			        $this->assertCount(1, Reply::all());
			    }

			    /** @test */
			    public function auth_user_can_update_reply()
			    {
			        $response = $this->put('/api/questions/' . $this->question->slug . '/replies/' . $this->reply->id, $this->data(), $this->server);

			        $response->assertStatus(202);

			        $this->assertCount(1, Reply::all());


			        $this->reply = $this->reply->fresh();

			        $this->assertEquals('Test Reply', $this->reply->body);


			        $response->assertJson([
			            'data' => [
			                'id' => $this->reply->id,
			                'body' => $this->reply->body,
			                'question_id' => $this->reply->question->id,
			                'user_name' => $this->reply->user->name,
			                'user_id' => $this->reply->user_id,
			                'created_at' => $this->reply->created_at->diffForHumans(),
			            ],
			        ]);
			    }

			    /** @test */
			    public function unauth_user_cannot_update_reply()
			    {
			        $response = $this->put('/api/questions/' . $this->question->slug . '/replies/' . $this->reply->id, $this->data(), array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(500);
			        
			        $this->assertCount(1, Reply::all());

			        $this->assertNotEquals('Test Reply', $this->reply->body);
			    }

			    /** @test */
			    public function auth_user_can_delete_reply()
			    {
			        $response = $this->delete('/api/questions/' . $this->question->slug . '/replies/' . $this->reply->id, array_merge($this->data(), ['body' => '']), $this->server);

			        $response->assertStatus(204);

			        $this->assertCount(0, Reply::all());
			    }

			    /** @test */
			    public function unauth_user_cannot_delete_reply()
			    {
			        $response = $this->delete('/api/questions/' . $this->question->slug . '/replies/' . $this->reply->id, array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(500);
			        
			        $this->assertCount(1, Reply::all());
			    }
			}

	[5.5] Testing for users
		php artisan make:test UserTest

		#tests->Feature->UserTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;
			use JWTAuth;
			use Tymon\JWTAuth\Exceptions\JWTException;

			use App\User;
			use Carbon\Carbon;
			use Hash;


			class UserTest extends TestCase
			{
			    use RefreshDatabase;

			    protected $user;
			    protected $token;
			    protected $server;

			    protected function setUp(): void 
			    {
			        parent::setUp();

			        $this->user = factory(User::class)->create(['birthday' => '05/10/1996']);

			        $this->token = JWTAuth::fromUser($this->user);

			        $this->server = [
			            'HTTP_Authorization' => 'Bearer '. $this->token
			        ];

			    }

			    private function signupData()
			    {
			        return [
			            'name' => 'User',
			            'birthday' => '05/10/1996',
			            'email' => 'user@test.com',
			            'password' => 'password'  
			        ];
			    }

			    private function loginData()
			    {
			        return [
			            'email' => $this->user->email,
			            'password' => 'password'
			        ];
			    }

			    /** @test */
			    public function guest_can_signup()
			    {
			        $response = $this->post('/api/auth/signup', $this->signupData());

			        $response->assertStatus(200);

			        $this->assertCount(2, User::all());
			    }

			    /** @test */
			    public function user_can_login()
			    {
			        $response = $this->post('/api/auth/login', $this->loginData());
			        
			        $response->assertStatus(200);

			        $this->assertCount(1, User::all());
			    }

			    /** @test */
			    public function auth_user_can_update_profile()
			    {
			        $response = $this->put('/api/users/' . $this->user->id, $this->signupData(), $this->server);

			        $response->assertStatus(202);

			        $this->assertCount(1, User::all());


			        $this->user = $this->user->fresh();

			        $this->assertEquals('User', $this->user->name);
			        $this->assertEquals('05/10/1996', $this->user->birthday->format('m/d/Y'));
			        $this->assertEquals('user@test.com', $this->user->email);
			        $this->assertTrue(Hash::check('password', $this->user->password));


			        $response->assertJson([
			            'data' => [
			                'name' => $this->user->name,
			                'birthday' => $this->user->birthday->format('m/d/Y'),
			                'email' => $this->user->email
			            ],
			        ]);
			    }

			    /** @test */
			    public function any_user_can_see_his_profile_and_questions()
			    {
			        $response = $this->get('/api/users/' . $this->user->id, $this->server);

			        $response->assertStatus(200);
			    }

			    /** @test */
			    public function field_is_required_signup_user()
			    {
			        collect(['name', 'birthday', 'email', 'password'])->each(function($field) {
			            $response = $this->post('/api/auth/signup', array_merge($this->signupData(), [$field => '']));
			            
			            $response->assertSessionHasErrors($field);

			            $this->assertCount(1, User::all());
			        });
			    }

			    /** @test */
			    public function field_is_required_edit_profile()
			    {
			        collect(['name', 'birthday', 'email', 'password'])->each(function($field) {
			            $response = $this->put('/api/users/' . $this->user->id, array_merge($this->signupData(), [$field => '']), $this->server);
			            
			            $response->assertSessionHasErrors($field);

			            $this->assertCount(1, User::all());
			        });
			    }

			    /** @test */
			    public function valid_email_field_is_required_signup_user()
			    {
			        $response = $this->post('/api/auth/signup', array_merge($this->signupData(), ['email' => '']));
			            
			        $response->assertSessionHasErrors('email');

			        $this->assertCount(1, User::all());
			    }

			    /** @test */
			    public function valid_email_field_is_required_edit_profile()
			    {
			        $response = $this->put('/api/users/' . $this->user->id, array_merge($this->signupData(), ['email' => 'notanemail']), $this->server);
			            
			        $response->assertSessionHasErrors('email');

			        $this->assertCount(1, User::all());
			    }

			    /** @test */
			    public function valid_birthday_field_is_required()
			    {
			        $this->assertInstanceOf(Carbon::class, $this->user->birthday);

			        $this->assertEquals('05.10.1996', $this->user->birthday->format('m.d.Y'));
			    }

			    /** @test */
			    public function auth_user_can_delete_profile()
			    {
			        $response = $this->delete('/api/users/' . $this->user->id, [], $this->server);
			        
			        $response->assertStatus(204);
			        
			        $this->assertCount(0, User::all());
			    }

			    /** @test */
			    public function unauth_user_cannot_delete_profile()
			    {
			    
			        $response = $this->delete('/api/users/' . $this->user->id, [], array_merge($this->server, ['HTTP_Authorization' => '']));
			        
			        $response->assertStatus(500);
			        
			        $this->assertCount(1, User::all());
			    
			    }
			}



6) Setup frontend
	[6.1] Install frontend frameworks
		#Vue
			composer require laravel/ui

			php artisan ui vue --auth

			npm install vue-router

			npm install && npm run dev

		#Tailwind
			composer require laravel-frontend-presets/tailwindcss --dev

			php artisan ui tailwindcss

			npm install && npm run dev

			#tailwind.config.js //It will be added by default
				module.exports = {
				  theme: {
				    extend: {
				      width: {
				        '96': '24rem'
				      },
				      height: {
				        '80': '20rem'
				      },
				      fontSize: {
				        '11xl': '9rem',
				      }
				    }
				  },
				  variants: {},
				  plugins: [
				    require('@tailwindcss/custom-forms')
				  ]
				}

		#Fontawesome
			npm install --save-dev @fortawesome/fontawesome-free            /

			#resources->js->app.js
				import '@fortawesome/fontawesome-free/css/all.css'
				import '@fortawesome/fontawesome-free/js/all.js'

			#Add this in any component to check
				<i class="fab fa-medium"></i>
				<i class="far fa-envelope"></i>

			#Reference: https://medium.com/front-end-weekly/how-to-use-fon-awesome-5-on-vuejs-project-ff0f28310821

	[6.2] Modify the backend enviornment
			#routes->web.php
				<?php

				use Illuminate\Support\Facades\Route;

				Route::view('/', 'home');
				Route::view('/{any}', 'home');
				Route::view('/{any}/{any1}', 'home');

			#app->Http->Controllers->HomeController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;

				class HomeController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('api');
				    }

				    public function index()
				    {
				        return view('home');
				    }
				}

			#resources->views->layouts->app.blade.php
				//Remove <nav></nav> component

			#resources->views->home.blade.php
				@extends('layouts.app')

				@section('content')
				    <App/>
				@endsection

	[6.3] Modify the frontend enviornment
		#Create an App component
			#resources->js->components->App.vue
				<template>
				    <div class="bg-red-500">
				        <h1>Hello</h1>
				    </div>
				</template>

				<script>
				    export default {
				        name: "App",
				    }
				</script>

		#Make it the main component in app.js
			#resources->js->app.js
				import Vue from 'vue';
				import router from './router/router';
				import App from './components/App';

				require('./bootstrap');

				window.Vue = require('vue');

				const app = new Vue({
				    el: '#app',
				    components: {
				        App
				    },
				    router
				});

			#Create a new router folder with router.js file
				#resources->js->router->router.js
					import Vue from 'vue';
					import VueRouter from 'vue-router';
					import ExampleComponent from '../components/ExampleComponent'

					Vue.use(VueRouter);

					export default new VueRouter({
					    routes: [
					        { path: '/', component: ExampleComponent},
					    ],
					    mode: 'history',
					    hash: false
					});

			#Display ExampleComponent using router-view
				#resources->js->components->App.vue
					<template>
					    <div class="bg-red-500">
					        <h1>Hello</h1>
					        <router-view></router-view>
					    </div>
					</template>

					<script>
					    export default {
					        name: "App",
					    }
					</script>

					<style>

					</style>



7) Complete frontend CRUD 
	[7.1] JavaScript setup
		#resources->js->helpers->user.js
			import Token from './token'
			import Storage from './storage'

			class User {
			    responseAfterLogin(res) {
			        const token = res.data.access_token
			        const username = res.data.user

			        if(Token.isValid(token))
			        {
			            Storage.store(token, username)

			            window.location = "/" //it refreshes the app without the hard refresh and redirects to '/'
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

			        window.location = "/"
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

		#resources->js->helpers->storage.js
			class Storage {
			    store(token, username) {
			        this.storeToken(token)
			        this.storeUsername(username)
			    }

			    storeToken(token) {
			        localStorage.setItem('token', token)
			    }

			    storeUsername(username) {
			        localStorage.setItem('username', username)
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
			        return JSON.parse(atob(payload))
			    }
			}

			export default Token = new Token();

		#resources->js->router->router.js
			import Vue from 'vue';
			import VueRouter from 'vue-router';
			import Dashboard from '../components/Dashboard'

			import Login from '../components/auth/Login'
			import Register from '../components/auth/Register'
			import Logout from '../components/auth/Logout'

			import UserQuestions from '../components/user/UserQuestions'
			import EditUser from '../components/user/EditUser'
			import FavouriteQuestions from '../components/user/FavouriteQuestions'

			import CreateQuestion from '../components/question/CreateQuestion'
			import QuestionReplies from '../components/question/QuestionReplies'
			import ThisMonthQuestions from '../components/question/ThisMonthQuestions'

			import CategoryCRUD from '../components/category/CategoryCRUD'
			import CategoryQuestions from '../components/category/CategoryQuestions'


			Vue.use(VueRouter);

			export default new VueRouter({
			    routes: [
			        { path: '/', component: Dashboard},
			        { path: '/login', component: Login},
			        { path: '/register', component: Register},
			        { path: '/logout', component: Logout},

			        { path: '/users/:id', component: UserQuestions},
			        { path: '/edituser', component: EditUser},
			        { path: '/favourites', component: FavouriteQuestions},

			        { path: '/createquestion', component: CreateQuestion},
			        { path: '/questions/:slug', component: QuestionReplies},
			        { path: '/thismonthquestions', component: ThisMonthQuestions},


			        { path: '/categories', component: CategoryCRUD},
			        { path: '/categories/:slug', component: CategoryQuestions},
			    ],

			    mode: 'history',

			    hash: false
			});

		#resources->js->app.js
			import Vue from 'vue';
			import router from './router/router';
			import App from './components/App';

			import '@fortawesome/fontawesome-free/css/all.css'
			import '@fortawesome/fontawesome-free/js/all.js'

			import User from './helpers/user.js';
			window.User = User

			console.log(User.id());

			window.EventBus = new Vue();

			require('./bootstrap');

			window.Vue = require('vue');

			const app = new Vue({
			    el: '#app',
			    components: {
			        App
			    },
			    router
			});

		#resources->js->bootstrap.js
			window.axios = require('axios');

			window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

			const JwtToken = `Bearer ${localStorage.getItem('token')}`

			window.axios.defaults.headers.common['Authorization'] = JwtToken;

	[7.2] Base Components
		#resources->js->components->App.vue
			<template>
			    <div class="flex h-screen bg-gray-100">
			        <div class="w-56 bg-white border-r-2 border-gray-300">
			            <NavBar/>
			        </div>

			        <div class="flex flex-col w-full h-screen">
			            <div class="bg-white p-2 border-b-2 border-gray-300">
			                <SearchBar/>
			            </div>

			            <div class="flex flex-col overflow-y-hidden">
			                <router-view class="overflow-x-hidden"></router-view>
			            </div>
			        </div>
			    </div>
			</template>

			<script>
			    import NavBar from "./NavBar"
			    import SearchBar from "./SearchBar"

			    export default {
			        name: "App",
			        
			        components: {NavBar, SearchBar}
			    }
			</script>

			<style scoped>

			</style>

		#resources->js->components->Navbar.vue
			<template>
			    <div class="flex-col h-screen overflow-y-hidden">
			        <div class="text-center">
			            <router-link to="/">
			                <i class="fab fa-blogger font-normal text-11xl mt-10 mb-4 text-blue-800"></i>
			            </router-link>
			        </div>

			        <router-link v-for="item in items" :key="item.title" v-if="item.show" :to="item.to" class=" font-normal text-xl">
			            <div class="flex items-center m-8">
			                <i :class="item.icon" class="h-12 w-12 text-blue-800 mx-2 hover:text-blue-500"></i>
			                
			                <p class="text-gray-700 font-bold text-xs uppercase mx-2 hover:text-blue-500">
			                    {{item.title}}
			                </p>
			            </div>
			        </router-link> 
			    </div>
			</template/>

			<script>
			    export default {
			        name: "NavBar",

			        created() {
			            EventBus.$on('logout', () => {
			                User.logout()
			            })
			        },

			        data(){
			            return {
			                items: [
			                    {title: 'This Month', icon: 'fas fa-calendar-alt', to: '/thismonthquestions', show: true},
			                    {title: 'Login', icon: 'fas fa-sign-in-alt', to: '/login', show: !User.loggedIn()},
			                    {title: 'Register', icon: 'fas fa-user-plus', to: '/register', show: !User.loggedIn()},
			                    {title: 'Edit Profile', icon: 'fas fa-user-cog', to: '/edituser', show: User.loggedIn()},
			                    {title: 'Create Question', icon: 'fas fa-plus-square', to: '/createquestion', show: User.loggedIn()}, 
			                    {title: 'Favourites', icon: 'fas fa-heart', to: '/favourites', show: User.loggedIn()},   
			                    {title: 'Manage Categories', icon: 'fas fa-tasks', to: '/categories', show: User.loggedIn()},   
			                    {title: 'Logout', to: '/logout', icon: 'fas fa-sign-out-alt', show: User.loggedIn()},          
			                ],
			            }
			        }
			    }
			</script>

		#resources->js->components->Dashboard.vue
			<template>
			    <div class="flex justify-center">
			        <div class="w-4/6">
			            <div v-for="question in questions" :key="question.id">
			                <QuestionCard :question="question"/>
			            </div>
			        </div>

			        <div class="w-2/6">
			            <div class="flex flex-wrap justify-center overflow-auto h-96">
			                <div v-for="category in categories" :key="category.id">
			                    <CategoryBox :category="category"/>
			                </div>
			            </div>
			        </div>  
			    </div>
			</template>

			<script>
			    import QuestionCard from './extras/QuestionCard'
			    import CategoryBox from './extras/CategoryBox'

			    export default {
			        name: 'Dashboard',

			        components: {QuestionCard, CategoryBox},

			        data() {
			            return {
			                questions: '',
			                categories: ''
			            }
			        },

			        created() {
			            axios.get('api/questions')
			                .then(res => this.questions = res.data.data)
			                .catch(errors => console.log(errors))

			            axios.get('api/categories')
			                .then(res => this.categories = res.data.data)
			                .catch(errors => console.log(errors))
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->SearchBar.vue
			<template>
			    <div class="flex justify-end items-center">
			        <div v-if="userLoggedIn"><Notifications/></div>

			        <SearchTab/>

			        <ImageCircle :name="userName" :avatar="userImage"/>
			    </div>
			</template>

			<script>
			    import SearchTab from './extras/SearchTab'
			    import ImageCircle from './extras/ImageCircle'
			    import Notifications from './extras/Notifications'

			    export default {
			        name: "SearchBar",

			        components: {ImageCircle, SearchTab, Notifications},

			        data() {
			            return {
			                userImage: null,
			            }
			        },

			        created() {
			            if(User.loggedIn()) {
			                axios.post('/api/auth/me')
			                    .then(res => this.userImage = res.data.avatar)
			            } 
			        },

			        computed: {
			            userName() {
			                if(User.loggedIn()) {
			                    return User.name()
			                }

			                return '?'
			            },

			            userLoggedIn() {
			                return User.loggedIn()
			            }
			        },
			    }
			</script>

			<style scoped>

			</style>

	[7.3] Extra Components
		#resources->js->components->extras->ImageUpload.vue
			<template>
			    <div>
			        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Profile Picture</label>

			        <input type="file" name='image' @change="getImage" class="py-2">

			        <div v-if="uploadedImage != null" class="text-center">
			            <img class="w-32 h-32 mx-auto mb-2 object-cover rounded-full" :src="uploadedImage" alt="Profile Pic">
			    
			            <i class="fas fa-upload mr-1"></i>
			            <button @click.prevent="uploadImage">Upload</button>

			            
			            <i class="fas fa-trash-alt ml-5 mr-1"></i>
			            <button @click.prevent="removeImage">Delete</button>
			        </div>

			        <div v-if="message" class="text-center mt-2 text-blue-700">
			            {{message}}
			        </div>
			    </div>
			</template/>

			<script>
			    export default {
			        name: 'ImageUpload',

			        data() {
			            return {
			                uploadedImage: null,
			                message: null
			            }
			        },

			        created() {
			            axios.post('/api/auth/me')
			                .then(res => this.uploadedImage = res.data.avatar)
			                .catch(errors => console.log(errors))
			        },

			        methods: {
			            getImage(e) {
			                let image = e.target.files[0]
			                let reader = new FileReader()

			                reader.readAsDataURL(image)
			                reader.onload = e => {
			                    this.uploadedImage = e.target.result
			                }
			            },

			            uploadImage() {
			                this.message = 'Profile picture is uploaded successfully!'
			                EventBus.$emit('uploadingImage', this.uploadedImage)
			            },

			            removeImage() {
			                this.uploadedImage = null
			                this.message = 'Profile picture is deleted successfully!'
			                EventBus.$emit('uploadingImage', this.uploadedImage)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->QuestionCard.vue
			<template>
			    <div class="m-3 bg-white rounded overflow-hidden shadow-lg">
			        <div class="px-6 py-3">
			            <div class="flex items-center justify-between">
			                <div class="flex">
			                    <ImageCircle :name="question.user_name" :avatar="question.user_avatar"/>

			                    <router-link v-if="question" :to="'/users/' + question.user_id" class="font-semibold text-md ml-2 text-blue-600">
			                        {{question.user_name}}

			                        <p class="text-gray-600 text-xs font-light">
			                            {{question.created_at}}
			                        </p>
			                    </router-link>
			                </div>

			                <div>
			                    <router-link v-if="question" :to="'/categories/' + question.category.slug" class="inline-block bg-gray-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 mr-2">
			                        #{{question.category.name}}
			                    </router-link>
			                </div>
			            </div>
			        </div>
			        
			        <div class="px-6 py-4">            
			            <router-link v-if="question" :to="'/questions/' + question.slug" class="font-normal text-gray-900 text-lg">
			                {{question.title}}
			            </router-link>

			            <p class="text-gray-800 text-sm mt-2">
			                {{question.body}}
			            </p>
			        </div>

			        <div class="px-6 py-4 flex items-center">
			            <Favourite :slug="question.slug" :count="question.favourite_count" :favourited="question.favourited"/>

			            <div v-if="question.replies" class="rounded-lg shadow-2xl border w-32 ml-6 border-gray-400 bg-transparent text-xs text-center text-blue-700 font-semibold py-2 px-4">
			                Total Replies: {{question.replies.length}}
			            </div>
			        </div>

			        <div v-if="message != null && errorQuestionSlug == question.slug" class="px-6 py-4 text-sm text-red-500">
			            {{message}}
			        </div>
			    </div>
			</template>

			<script>
			    import ImageCircle from './ImageCircle'
			    import Favourite from './Favourite'

			    export default {
			        name: 'QuestionCard',

			        components: {ImageCircle, Favourite},

			        props: ['question'],

			        data() {
			            return {
			                message: null,
			                errorQuestionSlug: null
			            }
			        },

			        created() {
			            EventBus.$on('displayingError', (slug) => {
			                this.errorQuestionSlug = slug
			                this.message = "*Please Login to add this question to favourites!*"
			            })
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->ImageCircle.vue
			<template>
			    <div>
			        <div v-if="userImage != null">
			            <img class="w-10 h-10 mx-auto object-cover rounded-full" :src="avatar" alt="Profile Pic">
			        </div>
			        
			        <div v-else class="rounded-full text-white bg-blue-400 w-10 h-10 border border-gray-300 flex justify-center items-center">
			            {{userName}}    
			        </div>
			    </div>
			</template>

			<script>
			    export default {
			        name: 'ImageCircle',

			        props: [
			            'name', 'avatar'
			        ],

			        computed: {
			            userName() {
			                if(this.name) {
			                    if(this.name.length > 1) {
			                        return this.name.match(/[A-Z]/g).slice(0, 2).join('')
			                    }

			                    return '?'
			                }
			            },

			            userImage() {
			                return this.avatar
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->ReplyCard.vue
			<template>
			    <div class="w-4/6 m-3 p-3 bg-white rounded shadow-xl">
			        <div class="px-4 py-4">
			            <div class="w-full flex items-center">
			                <div class="w-5/6 flex items-center">
			                    <ImageCircle :name="reply.user_name" :avatar="reply.user_avatar"/>

			                    <router-link :to="'/users/' + reply.user_id" class="font-semibold text-md ml-2 text-blue-600">
			                        {{reply.user_name}}

			                        <p class="text-gray-600 text-xs font-light">
			                            {{reply.created_at}}
			                        </p>
			                    </router-link>
			                </div>
			                
			                <div v-if="own" class="relative w-1/6 flex mb-4justify-end">            
			                    <button @click="changeEditMode" class="w-16 mx-2 px-2 py-1 border border-blue-600 text-blue-600 text-xs rounded focus:outline-none outline-none hover:bg-blue-600 hover:text-white"> <i class="fas fa-edit"></i> </button>
			                    <button @click="deleteMode = true" class="w-20 mx-2 px-2 py-1 border border-red-600 text-red-600 text-xs rounded focus:outline-none hover:bg-red-600 hover:text-white"> <i class="fas fa-trash-alt"></i> </button>

			                    <div v-if="deleteMode" class="absolute bg-blue-900 rounded-lg right-0 text-white w-64 z-10 mt-8 p-2">
			                        <p>Are you sure you want to delete this reply?</p>

			                        <div class="flex items-center justify-end mt-2">
			                            <button @click="deleteReply" class="mx-2 px-4 py-2 bg-red-500 rounded-full text-sm focus:outline-none hover:bg-red-600">Delete</button>
			                            <button @click="deleteMode = false" class="text-sm focus:outline-none hover:text-gray-400">Cancel</button>
			                        </div>
			                    </div>
			                </div>
			            </div>
			        </div>
			        
			        <div v-if="editMode" class="flex px-6 mb-4">            
			            <input v-model="replyForm.body" class="appearance-none bg-transparent border border-gray-400 w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Category name">

			            <button @click="editReply" class="mx-2 px-2 border border-green-500 text-green-500 text-white text-sm rounded-full focus:outline-none hover:bg-green-500 hover:text-white"><i class="fas fa-save"></i></button>
			            <button @click="editMode = false" class="px-2 border border-gray-700 text-gray-700 text-sm rounded-full focus:outline-none hover:bg-gray-700 hover:text-white"><i class="fas fa-times"></i></button>
			        </div>

			        <div v-else class="px-6 mb-4">            
			            <p class="ml-10 text-gray-800 text-sm">
			                {{reply.body}}
			            </p>
			        </div>

			        <div v-if="deleteMode" class="bg-black opacity-25 absolute z-0 left-0 top-0 right-0 bottom-0" @click="deleteMode = false"></div>
			            
			        <Like :reply="reply"/>

			    </div>
			</template>

			<script>
			    import ImageCircle from './ImageCircle'
			    import Like from './Like'

			    export default {
			        name: 'ReplyCard',

			        components: {ImageCircle, Like},

			        props: ['reply', 'index'],

			        computed: {
			            own() {
			                return User.own(this.reply.user_id)
			            }
			        },

			        data() {
			            return {
			                replyForm: {
			                    body: ''
			                },
			                deleteMode: false,
							editMode: false
			            }
			        },

			        methods: {
			            deleteReply() {
			                axios.delete(`/api/questions/${this.$route.params.slug}/replies/${this.reply.id}`)
			                    .then(res => {
			                        this.deleteMode = false
			                        EventBus.$emit('deletingReply', this.index)
			                        EventBus.$emit('changingMaxRepliesCount')
			                    })
			                    .catch(error => this.errors = error.response.data.error)
			            },

			            changeEditMode() {
			                this.editMode = true
			                this.replyForm.body = this.reply.body
			            },

			            editReply() {
			                axios.put(`/api/questions/${this.$route.params.slug}/replies/${this.reply.id}`, this.replyForm)
			                    .then(res => {
			                        this.reply.body = res.data.data.body
			                        this.editMode = false
			                    })
			                    .catch(error => this.errors = error.response.data.error)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->CategoryBox.vue
			<template>
			    <div>
			        <router-link :to="'/categories/' + category.slug">
			            <div class="flex justify-center items-center w-32 h-32 m-3 bg-white text-gray-700 rounded shadow-xl border-2 hover:border-blue-600">
			                {{category.name}}
			            </div>
			        </router-link>
			    </div>
			</template>

			<script>
			    export default {
			        name: 'CategoryBox',

			        props: ['category'],
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->CategoryCard.vue
			<template>
			    <div>
			        <div class="flex m-8 bg-transparent rounded shadow-xl">
			            <div class="w-4/6">{{category.name}}</div>    

			            <div class="flex w-2/6 justify-end">
			                <button @click="changeEditMode(index)" class="mx-3">edit</button>

			                <button @click="deleteMode = true" class="">delete</button>
			            </div>
			        </div>

			        <div class="flex">
			            <div class="w-4/6"></div>    
			            
			            <div v-if="deleteMode" class="flex items-center w-3/6 bg-blue-900 rounded-lg text-white w-64 right-0 z-10 mt-2 p-3">
			                <p>Are you sure you want to delete this contact?</p>
			                
			                <button @click="deleteCategory(index)" class="ml-4 px-4 py-2 bg-red-500 rounded text-sm">Delete</button>
			                <button @click="deleteMode = false" class="text-sm">Cancel</button>          
			            </div>
			        </div>
			    </div>
			</template/>

			<script>
			    export default {
			        name: 'CategoryCard',

			        props: ['category', 'index'],

			        data() {
			            return {
			                deleteMode: false
			            }
			        },

			        methods: {
			            changeEditMode(index) {
			                EventBus.$emit('changingEditMode', index)
			            },

			            deleteCategory(index) {
			                EventBus.$emit('deletingCategory', index)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->Like.vue
			<template>
			    <div>
			        <button @click="likeIt" :class="color" class="focus:outline-none">
			            <i class="fas fa-thumbs-up ml-5"></i> {{count}}
			        </button>

			        <div v-if="message != null" class="mt-3 ml-5 text-sm text-red-500">
			            {{message}}
			        </div>
			    </div>
			</template/>

			<script>
			    export default {
			        name: 'Like',

			        props: ['reply'],

			        data() {
			            return {
			                id: this.reply.id,
			                count: this.reply.like_count,
			                liked: this.reply.liked,
			                message: null
			            }
			        },

			        computed: {
			            color() {
			                return this.liked ? 'text-green-500' : 'text-gray-700'
			            }
			        },

			        methods: {
			            likeIt() {
			                if(User.loggedIn()) {
			                    this.liked ? this.removeLike() : this.addLike()
			                    this.liked = !this.liked
			                } else {
			                    this.message = "*Please Login to give a like!*"
			                }
			            },

			            addLike() {
			                axios.post(`/api/replies/${this.id}/like`)
			                    .then(res => this.count++)
			                    .catch(errors => console.log(errors))
			            },

			            removeLike() {
			                axios.delete(`/api/replies/${this.id}/like`)
			                    .then(res => this.count--)
			                    .catch(errors => console.log(errors))
			            }
			        }

			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->Favourite.vue
			<template>
			    <div class="flex flex-col">
			        <button @click="favouriteIt" :class="color" class="focus:outline-none">
			            <i class="fas fa-heart"></i> {{count}}
			        </button>
			    </div>
			</template>

			<script>
			    export default {
			        name: 'Favourite',

			        props: ['slug', 'count', 'favourited'],

			        computed: {
			            color() {
			                return this.favourited ? 'text-red-500' : 'text-gray-700'
			            }
			        },

			        methods: {
			            favouriteIt() {
			                if(User.loggedIn()) {
			                    this.favourited ? this.removeFavourite() : this.addFavourite()
			                    this.favourited = !this.favourited
			                } else {
			                    EventBus.$emit('displayingError', (this.slug))
			                }
			            },

			            addFavourite() {
			                axios.post(`/api/questions/${this.slug}/favourite`)
			                    .then(res => this.count ++)
			                    .catch(errors => console.log(errors))
			            },

			            removeFavourite() {
			                axios.delete(`/api/questions/${this.slug}/favourite`)
			                    .then(res => this.count --)
			                    .catch(errors => console.log(errors))
			            }
			        }

			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->MaxRepliesBox.vue
			<template>
			    <div class="flex flex-wrap justify-center overflow-auto h-96">
			        <div v-for="user in userReplies" :key="user.id">
			            <router-link :to="'/users/' + user[0].user_id">
			                <div v-if="user[0].user_avatar != null">
			                    <img :src="user[0].user_avatar" class="flex justify-center object-cover items-center w-32 h-32 m-3 rounded shadow-xl border-2 hover:border-blue-600" alt="Profile Pic">
			                </div>

			                <div v-else class="flex justify-center text-center items-center w-32 h-32 m-3 bg-white text-gray-700 rounded shadow-xl border-2 hover:border-blue-600">
			                    {{user[0].user_name}}
			                </div>

			                <p class="text-sm text-gray-800 text-center">
			                    Total Replies: {{user.length}}
			                </p>
			            </router-link>
			        </div>
			    </div>
			</template/>

			<script>
			export default {
			    name: 'MaxRepliesBox',

			    data() {
			        return {
			            userReplies: '',
			        }
			    },

			    created() {
			        axios.post('/api/maximumreplies', {
			            slug: this.$route.params.slug
			        })
			            .then(res => this.userReplies = res.data)
			            .catch(errors => console.log(errors))

			        this.listen()
			    },

			    methods: {
			        listen() {
			             EventBus.$on('changingMaxRepliesCount', () => {
			                axios.post('/api/maximumreplies', {
			                    slug: this.$route.params.slug
			                })
			                    .then(res => this.userReplies = res.data)
			            })
			        }
			    }

			}
			</script>

			<style>

			</style>

		#resources->js->components->extras->MaxQuestionsBox.vue
			<template>
			    <div class="flex flex-wrap justify-center overflow-auto h-96">
			        <div v-for="user in userQuestions" :key="user.id">
			            <router-link :to="'/users/' + user[0].user_id">
			                <div v-if="user[0].user_avatar != null">
			                    <img :src="user[0].user_avatar" class="flex justify-center object-cover items-center w-32 h-32 m-3 rounded shadow-xl border-2 hover:border-blue-600" alt="Profile Pic">
			                </div>

			                <div v-else class="flex justify-center text-center items-center w-32 h-32 m-3 bg-white text-gray-700 rounded shadow-xl border-2 hover:border-blue-600">
			                    {{user[0].user_name}}
			                </div>

			                <p class="text-sm text-gray-800 text-center">
			                    Total Replies: {{user.length}}
			                </p>
			            </router-link>
			        </div>
			    </div>
			</template/>

			<script>
			export default {
			    name: 'MaxQuestionsBox',

			    data() {
			        return {
			            userQuestions: '',
			        }
			    },

			    created() {
			        axios.post('/api/maximumquestions', {
			            slug: this.$route.params.slug
			        })
			            .then(res => this.userQuestions = res.data)
			            .catch(errors => console.log(errors))
			    },
			}
			</script>

			<style>

			</style>

		#resources->js->components->extras->ProfileCard.vue
			<template>    
				<div id="profile" class="lg:w-4/5 rounded h-full  mx-4">
				
					<div class="p-6 text-center lg:text-left shadow-lg bg-white">
						<h1 class="text-3xl font-medium pt-4 pt-0">{{user.name}}</h1>
						<div class="mx-auto lg:mx-0 w-4/5 border-b-2 border-blue-500"></div>
						<p class="pt-4 text-base font-semibold text-gray-900 flex items-center justify-center lg:justify-start"><svg class="h-4 fill-current text-blue-500 pr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9 12H1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-8v2H9v-2zm0-1H0V5c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v6h-9V9H9v2zm3-8V2H8v1h4z"/></svg> {{user.email}}</p>
						<p class="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start"><svg class="h-4 fill-current text-blue-500 pr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z"/></svg> {{user.birthday}}</p>
						<p class="pt-8 text-sm">Totally optional short description about yourself, what you do and so on.</p>

						<div v-if="loggedin && own" class="pt-6 pb-4">
							<router-link to="/edituser" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
							    Edit Profile
							</router-link> 
						</div>

						<div class="mt-4 pb-8 lg:pb-0 w-4/5 lg:w-full mx-auto flex flex-wrap items-center justify-between">
							<a class="link" href="#" data-tippy-content="@facebook_handle"><svg class="h-6 fill-current text-gray-600 hover:text-blue-500" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.41c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.097 2.796.141v3.24h-1.921c-1.5 0-1.792.721-1.792 1.771v2.311h3.584l-.465 3.63H16.56V24h6.115c.733 0 1.325-.592 1.325-1.324V1.324C24 .593 23.408 0 22.676 0"/></svg></a>
							<a class="link" href="#" data-tippy-content="@github_handle"><svg class="h-6 fill-current text-gray-600 hover:text-blue-500" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
							<a class="link" href="#" data-tippy-content="@unsplash_handle"><svg class="h-6 fill-current text-gray-600 hover:text-blue-500" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Unsplash</title><path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z"/></svg></a>
							<a class="link" href="#" data-tippy-content="@dribble_handle"><svg class="h-6 fill-current text-gray-600 hover:text-blue-500" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg></a>
						</div>
					</div>
				</div>
			</template>

			<script>
			export default {
			    name: 'ProfileCard',

			    props: ['user'],

			    computed: {
			        loggedin() {
			            return User.loggedIn()
			        },

			        own() {
			            return User.own(this.user.id)
			        }
			    }
			}
			</script>

			<style>

			</style>

	[7.4] Auth Components
		#resources->js->components->auth->Login.vue
			<template>
			    <div class="w-full my-24 flex justify-center">
			        <form @submit.prevent="login" class="px-8 pt-6 pb-8 mb-4 w-2/6 bg-white shadow-2xl rounded justify-center absolute">
			            
			            <h1 class="text-3xl pt-6 text-blue-800">Welcome Back</h1>
			            <h2 class="text-base text-gray-700">Enter your details below!</h2>

			            <div class="my-8">
			                <label for="email" class="uppercase text-blue-800 text-xs font-bold absolute p-2">E-mail</label>

			                <input v-model="loginForm.email" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Enter your Email">

			                <span v-if="errors.email" class="text-red-700 pt-1 text-sm" role="alert">
			                    {{errors.email[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label for="password" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Password</label>

			                <input v-model="loginForm.password" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="password" placeholder="Enter your password">

			                <span v-if="errors.password" class="text-red-700 pt-1 text-sm" role="alert">
			                    {{errors.password[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <button type="submit" class="mt-8 uppercase rounded-lg shadow-2xl border border-blue-800 bg-transparent text-blue-800 hover:bg-gray-100 hover:text-gray-100 hover:bg-blue-700 focus:outline-none font-semibold py-2 px-4">
			                    Login
			                </button>
			            </div>

			            <div class="flex justify-between text-gray-800">
			                <a class="btn btn-link" href="">
			                    Forget Your Password?
			                </a>
			            </div>
			        </form>
			    </div>
			</template/>

			<script>
			    export default {
			        name: "Login",

			        data() {
			            return {
			                loginForm: {
			                    email: null,
			                    password: null
			                },
			                errors: {}
			            }
			        },

			        methods: {
			            login() {
			                 axios.post('/api/auth/login', this.loginForm)
			                    .then(res => User.responseAfterLogin(res))
			                    .catch(errors => this.errors = errors.response.data.errors)
			            }

			        }
			    }
			</script/>

		#resources->js->components->auth->Register.vue
			<template>
			    <div class="w-full justify-center flex">
			        <div class="bg-white w-96 absolute rounded-lg shadow-2xl p-6 my-4">

			            <h1 class="text-3xl pt-6 text-blue-800">Welcome Back</h1>
			            <h2 class="text-base text-gray-700">Enter your details below!</h2>

			            <form class="mt-8" @submit.prevent="register">

			                <div class="relative mb-4">
			                    <label for="name" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Name</label>

			                    <input v-model="registerForm.name" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Register your name">

			                    <span v-if="errors.name" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.name[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-4">
			                    <label for="birthday" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Birthday</label>

			                    <input v-model="registerForm.birthday" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="mm/dd/yyyy">

			                    <span v-if="errors.birthday" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.birthday[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-4">
			                    <label for="email" class="uppercase text-blue-800 text-xs font-bold absolute p-2">E-mail</label>

			                    <input v-model="registerForm.email" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="email" placeholder="Register your email">

			                    <span v-if="errors.email" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.email[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-4">
			                    <label for="password" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Password</label>

			                    <input v-model="registerForm.password" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="password" placeholder="Enter your password">

			                    <span v-if="errors.password" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.password[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-6">
			                    <label for="password_confirmation" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Password</label>

			                    <input v-model="registerForm.password_confirmation" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="password" placeholder="Confirm your password">
			                </div>

			                <ImageUpload/>

			                <div class="flex justify-center">
			                    <button type="submit" class="mt-4 uppercase rounded-lg shadow-2xl border border-blue-800 bg-transparent text-blue-800 hover:bg-gray-100 hover:text-gray-100 hover:bg-blue-800 focus:outline-none font-semibold py-2 px-4">
			                        Register
			                    </button>
			                </div>
			            </form>
			        </div>
			    </div>
			</template>

			<script>
			    import ImageUpload from '../extras/ImageUpload'

			    export default {
			        name: "Register",

			        components: {ImageUpload},

			        data() {
			            return {
			                registerForm: {
			                    name: null,
			                    birthday: null,
			                    email: null,
			                    password: null,
			                    password_confirmation: null,
			                    avatar: null
			                },
			                errors: {}
			            }
			        },

			        created() {
			            this.listen()
			        },

			        methods: {
			            register() {
			                 axios.post('/api/auth/signup', this.registerForm)
			                    .then(res => User.responseAfterLogin(res))
			                    .catch(error => this.errors = error.response.data.errors)
			            },

			            listen() {
			                EventBus.$on('uploadingImage', (uploadedImage) => {
			                    this.registerForm.avatar = uploadedImage
			                })
			            }

			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->auth->Logout.vue
			<template>
  
			</template/>

			<script>
			    export default {
			        name: "Logout",

			        created(){
			            EventBus.$emit('logout')
			        }
			    }
			</script>

			<style>

			</style>

	[7.5] Question Components
		#resources->js->components->question->QuestionReplies.vue
			<template>
			    <div class="flex">
			        <div class="w-4/6">
			            <div v-if="editingMode">
			                <EditQuestion :question="question"/>
			            </div>

			            <div v-else>
			                <ShowQuestion :question="question" :replies="replies"/>
			            </div>
			        </div>
			        
			        <div class="w-2/6">
			            <MaxRepliesBox/>
			        </div>
			    </div>
			</template>

			<script>
			    import ShowQuestion from './ShowQuestion'
			    import EditQuestion from './EditQuestion'
			    import MaxRepliesBox from '../extras/MaxRepliesBox'

			    export default {
			        name: 'QuestionReplies',

			        components: {ShowQuestion, EditQuestion, MaxRepliesBox},

			        data() {
			            return {
			                question: '',
			                replies: '',
			                editingMode: false
			            }
			        },

			        created() {
			            this.listen()

			            axios.get(`/api/questions/${this.$route.params.slug}`)
			                .then(res => {
			                    this.question = res.data.data
			                    this.replies = res.data.data.replies
			                })
			                .catch(errors => console.log(errors))
			        },
			        
			        methods: {
			            listen() {
			                EventBus.$on('editingQuestion', () => {
			                    this.editingMode = true
			                }),

			                EventBus.$on('editingCancel', () => {
			                    this.editingMode = false
			                })
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->question->ShowQuestion.vue
			<template>
			    <div class="h-screen ml-4">
			        <div class="mx-3 my-6">
			            <a href="#" class="font-semibold text-blue-800 hover:text-blue-500" @click="$router.back()">
			                <i class="fas fa-angle-double-left mr-1"></i> Back
			            </a>
			        </div>
			        
			        <QuestionCard :question="question"/>

			        <div v-if="own" class="relative mx-3">
			            <button @click="editQuestion" class="mt-8 uppercase rounded-lg shadow-2xl border border-gray-300 text-xs text-gray-900 bg-white hover:border-blue-700 hover:text-blue-700 font-semibold py-2 px-3 focus:outline-none"><i class="fas fa-edit"></i> Edit</button>
			            <button @click="deleteMode = true" class="mt-8 uppercase rounded-lg shadow-2xl border border-gray-300 text-xs text-gray-900 bg-white hover:border-red-500 hover:text-red-500 font-semibold py-2 px-3 focus:outline-none"><i class="fas fa-trash"></i> Delete</button>
			        
			            <div v-if="deleteMode" class="ml-3 absolute bg-blue-900 rounded-lg text-white w-2/6 z-10 mt-2 p-3">
			                <p>Are you sure you want to delete this contact?</p>

			                <div class="flex items-center justify-end mt-3">
			                    <button @click="deleteQuestion" class="ml-6 px-4 py-2 bg-red-500 rounded text-sm">Delete</button>
			                    <button @click="deleteMode = false" class="text-sm">Cancel</button>
			                </div>
			            </div>
			        </div>

			        <CreateReply v-if="loggedIn"/>

			        <div class="ml-24 border-l-4 border-blue-500">
			            <div v-for="(reply, index) in replies" :key="reply.id" v-if="reply" class="">
			                <ReplyCard :reply="reply" :index="index"/>
			            </div>
			        </div>

			        <div v-if="deleteMode" class="bg-black opacity-25 absolute z-0 left-0 top-0 right-0 bottom-0" @click="deleteMode = false"></div>
			    </div>
			</template>

			<script>
			    import QuestionCard from '../extras/QuestionCard'
			    import ReplyCard from '../extras/ReplyCard'
			    import CreateReply from '../reply/CreateReply'

			    export default {
			        name: 'ShowQuestion',

			        components: {QuestionCard, ReplyCard, CreateReply},

			        props: ['question', 'replies'],

			        computed: {
			            own() {
			                return User.own(this.question.user_id)
			            },

			            loggedIn() {
			                return User.loggedIn()
			            }
			        },

			        data() {
			            return {
			                deleteMode:false
			            }
			        },

			        created() {
			            this.listen()
			        },

			        methods: {
			            deleteQuestion() {
			                axios.delete(`/api/questions/${this.$route.params.slug}`)
			                    .then(this.$router.push('/'))
			                    .catch(errors => console.log(errors));
			            },

			            editQuestion() {
			                EventBus.$emit('editingQuestion')
			            },

			            listen() {
			                EventBus.$on('creatingReply', (reply) => {
			                    this.replies.unshift(reply)
			                })

			                EventBus.$on('deletingReply', (index) => {
			                    this.replies.splice(index, 1)
			                })

			            },
			        },    
			    }
			</script>

			<style>

			</style>

		#resources->js->components->question->CreateQuestion.vue
			<template>
			    <div class="w-full my-16 flex justify-center">
			        <form @submit.prevent="createQuestion" class="px-8 pt-6 pb-8 mb-4 w-3/6 bg-white shadow-2xl rounded justify-center absolute">
			            <h1 class="text-3xl py-3 text-blue-800">Ask Question!</h1>

			            <div class="flex pb-6">
			                <ImageCircle :name="user.name" :avatar="user.avatar"/>

			                <router-link v-if="user" :to="'/users/' + user.id" class="font-semibold text-md ml-2 text-blue-600">
			                    {{user.name}}

			                    <p class="text-gray-600 text-xs font-light">
			                        {{user.email}}
			                    </p>
			                </router-link>
			            </div>

			            <div class="reletive">
			                <label for="title" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Title</label>

			                <div class="col-md-6">
			                    <input v-model="questionForm.title" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Add the title">

			                    <span v-if="errors.title" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.title[0]}}
			                    </span>
			                </div>
			            </div>

			            <div class="pt-3">
			                <label for="body" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Write the message</label>

			                <div class="">
			                    <textarea v-model="questionForm.body" rows="3" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Write the description">
			                    
			                    </textarea>
			                    <span v-if="errors.body" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.body[0]}}
			                    </span>
			                </div>
			            </div>

			            <div class="pt-3">
			                <label for="category_id" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Category</label>

			                <div class="">
			                    <select v-model="questionForm.category_id" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline">
			                        <option v-for="category in categories" :key="category.id" :value="category.id">{{category.name}}</option>
			                    </select>
			                    
			                    <span v-if="errors.category_id" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.category_id[0]}}
			                    </span>
			                </div>
			            </div>

			            <div class="">
			                <button type="submit" class="mt-8 uppercase rounded-lg shadow-2xl border text-sm bg-gray-100 text-gray-100 bg-blue-700 hover:border-blue-800 hover:bg-transparent hover:text-blue-800 font-semibold py-2 px-4 focus:outline-none">
			                    Post
			                </button>

			                <router-link to="/" class="mt-8 text-right uppercase rounded-lg text-blue-800 border text-sm hover:border-blue-800 font-semibold py-2 px-4 focus:outline-none">
			                    Cancel
			                </router-link>
			            </div>
			        </form>
			    </div>
			</template>

			<script>
			    import ImageCircle from '../extras/ImageCircle'

			    export default {
			        name: 'CreateQuestion',

			        components: {ImageCircle},

			        data() {
			            return {
			                questionForm: {
			                    title: null,
			                    body: null,
			                    category_id: null
			                },
			                categories: {},
			                user: {},
			                errors: {}
			            }
			        },

			        created() {
			            if(!User.loggedIn()) {
			                this.$router.push('/')
			            }

			            axios.get('/api/categories')
			                .then(res => this.categories = res.data.data)
			                .catch(errors => console.log(errors))

			            axios.post('/api/auth/me')
			                    .then(res => {
			                        this.user = res.data
			                    })
			                    .catch(errors => console.log(errors))
			        },

			        methods: {
			            createQuestion() {
			                axios.post('/api/questions', this.questionForm)
			                    .then(res => this.$router.push('/'))
			                    .catch(error => this.errors = error.response.data.errors)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->question->EditQuestion.vue
			<template>
			    <div class="w-full my-16 flex justify-center">
			        <form @submit.prevent="editQuestion" class="px-8 pt-6 pb-8 mb-4 w-3/6 bg-white shadow-2xl rounded justify-center absolute">
			            <h1 class="text-3xl py-3 text-blue-800">Edit Question:</h1>

			            <div class="flex pb-6">
			                <ImageCircle :name="question.user_name" :avatar="question.user_avatar"/>

			                <router-link v-if="question" :to="'/users/' + question.user_id" class="font-semibold text-md ml-2 text-blue-600">
			                    {{question.user_name}}

			                    <p class="text-gray-600 text-xs font-light">
			                        {{question.created_at}}
			                    </p>
			                </router-link>
			            </div>
			            
			            <div class="reletive">
			                <label for="title" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Title</label>

			                <div class="col-md-6">
			                    <input v-model="questionForm.title" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Add the title">

			                    <span v-if="errors.title" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.title[0]}}
			                    </span>
			                </div>
			            </div>

			            <div class="pt-3">
			                <label for="body" class="absolute uppercase text-blue-800 text-xs font-bold p-2">Edit the message</label>

			                <div class="">
			                    <textarea v-model="questionForm.body" rows="3" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Write the description">
			                    
			                    </textarea>
			                    <span v-if="errors.body" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.body[0]}}
			                    </span>
			                </div>
			            </div>

			            <div class="pt-3">
			                <label for="category_id" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Category</label>

			                <div class="">
			                    <select v-model="questionForm.category_id" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline">
			                        <option v-for="category in categories" :key="category.id" :value="category.id">{{category.name}}</option>
			                    </select>
			                    
			                    <span v-if="errors.category_id" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.category_id[0]}}
			                    </span>
			                </div>
			            </div>

			            <div class="">
			                <button type="submit" class="mt-8 uppercase rounded-lg shadow-2xl border text-sm bg-gray-100 text-gray-100 bg-blue-700 hover:border-blue-800 hover:bg-transparent hover:text-blue-800 font-semibold py-2 px-4 focus:outline-none">
			                    Update
			                </button>

			                <button @click="editCancel" class="mt-8 text-right uppercase rounded-lg text-blue-800 border text-sm hover:border-blue-800 font-semibold py-2 px-4 focus:outline-none">
			                    Cancel
			                </button>
			            </div>
			        </form>
			    </div>
			</template>

			<script>
			    import ImageCircle from '../extras/ImageCircle'

			    export default {
			        name: 'EditQuestion',

			        components: {ImageCircle},

			        props: ['question'],

			        data() {
			            return {
			                questionForm: {
			                    title: null,
			                    body: null,
			                    category_id: null
			                },
			                categories: {},
			                errors: {},
			            }
			        },

			        mounted() {
			            this.questionForm = this.question
			        },

			        created() {
			            axios.get('/api/categories')
			                .then(res => this.categories = res.data.data)
			                .catch(errors => console.log(errors))
			        },

			        methods: {
			            editQuestion() {
			                axios.put(`/api/questions/${this.$route.params.slug}`, this.questionForm)
			                    .then(res => {
			                        this.editCancel()
			                        this.$router.push('/')
			                    })
			                    .catch(error => this.errors = error.response.data.errors)
			            },

			            editCancel() {
			                EventBus.$emit('editingCancel')
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->question->ThisMonthQuestions.vue //It contains Pagination. It is explained later in the last few sections.
			<template>
			    <div>
			        <div class="flex justify-center">
			            <div class="w-4/6">
			                <div v-for="question in questions" :key="question.id">
			                    <QuestionCard :question="question"/>
			                </div>

			                <div class="flex justify-between m-3 my-5 rounded w-auto font-sans">
			                    <div>
			                        <a @click="getQuestions(pagination.first_page_url)" class="block text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500 border border-gray-400 px-3 py-2 rounded" href="#">First</a>
			                    </div>

			                    <div>
			                        <ul class="flex justify-center">
			                            <li @click="getQuestions(pagination.prev_page_url)"><a :class="prevDisable" class="block border border-gray-300 px-3 py-2 rounded" href="#"><i class="fas fa-backward"></i></a></li>
			                            <li><a class="cursor-not-allowed block text-blue-800 bg-white border border-gray-400 px-3 py-2 rounded" href="#">Page {{pagination.current_page}} of {{pagination.last_page}}</a></li>
			                            <li @click="getQuestions(pagination.next_page_url)"><a :class="nextDisable" class="block border border-gray-300 px-3 py-2 rounded" href="#"><i class="fas fa-forward"></i></a></li>
			                        </ul>
			                    </div>

			                    <div>
			                        <a @click="getQuestions(pagination.last_page_url)" class="block text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500 border border-gray-400 px-3 py-2 rounded" href="#">Last</a>
			                    </div>
			                </div>
			            </div>

			            <div class="w-2/6">
			                <div class="flex flex-wrap justify-center overflow-auto h-96">
			                    <div v-for="category in categories" :key="category.id">
			                        <CategoryBox :category="category"/>
			                    </div>
			                </div>
			            </div>  
			        </div>   
			    </div>
			    
			</template>

			<script>
			    import QuestionCard from '../extras/QuestionCard'
			    import CategoryBox from '../extras/CategoryBox'

			    export default {
			        name: 'ThisMonthQuestions',

			        components: {QuestionCard, CategoryBox},

			        data() {
			            return {
			                questions: '',
			                categories: '',
			                pagination: {}
			            }
			        },

			        computed: {
			            prevDisable() {
			                return this.pagination.prev_page_url ? 'text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500' : 'cursor-not-allowed text-gray-500 bg-gray-100'
			            },

			            nextDisable() {
			                return this.pagination.next_page_url ? 'text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500' : 'cursor-not-allowed text-gray-500 bg-gray-100'
			            }
			        },

			        created() {
			            this.getQuestions()
			            this.getCategories()
			        },

			        methods: {
			            getQuestions(page_url) {
			                page_url = page_url || 'api/thismonthquestions'

			                axios.post(page_url)
			                    .then(res => {
			                        this.questions = res.data.data
			                        this.makePagination(res.data.meta, res.data.links)
			                    })
			                    .catch(errors => console.log(errors))
			            },

			            makePagination(meta, links) {
			                this.pagination = {
			                    current_page: meta.current_page,
			                    last_page: meta.last_page,
			                    
			                    next_page_url: links.next,
			                    prev_page_url: links.prev,
			                    first_page_url: links.first,
			                    last_page_url: links.last
			                }
			            },

			            getCategories() {
			                axios.get('api/categories')
			                    .then(res => this.categories = res.data.data)
			                    .catch(errors => console.log(errors))
			            }
			        }
			    }
			</script>

			<style>

			</style>

	[7.6] Category Components
		#resources->js->components->category->CategoryQuestions.vue
			<template>
			    <div class="flex w-full">
			        <div class="flex-col w-4/6">
			            <div v-if="categoryQuestions[0]" class="text-center flex justify-center">
			                <CategoryBox :category="categoryQuestions[0].category"/>
			            </div>
			            
			            <div v-for="question in categoryQuestions" :key="question.id">
			                <QuestionCard :question="question"/>
			            </div>
			        </div>

			        <div class="flex-col w-2/6">
			            <MaxQuestionsBox/>
			        </div>

			    </div>
			    
			</template>

			<script>
			    import QuestionCard from '../extras/QuestionCard'
			    import CategoryBox from '../extras/CategoryBox'
			    import MaxQuestionsBox from '../extras/MaxQuestionsBox'

			    export default {
			        name: 'CategoryQuestions',

			        components: {QuestionCard, CategoryBox, MaxQuestionsBox},

			        data() {
			            return {
			                categoryQuestions: ''
			            }
			        },

			        created() {
			             axios.get(`/api/categories/${this.$route.params.slug}`)
			                .then(res => this.categoryQuestions = res.data.data)
			                .catch(errors => console.log(errors))
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->category->CategoryCRUD.vue
			<template>
			    <div class="m-5">
			        <form class="w-full max-w-sm" @submit.prevent="submitCategory">
			            <div class="flex items-center border-b border-b-2 border-blue-500 py-2">
			                <input v-model="categoryForm.name" class="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Category name">
			                
			                <div v-if="!editMode">
			                    <button type="submit" class="flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"> Create </button>
			                </div>

			                <div v-else>
			                    <button  type="submit" class="flex-shrink-0 bg-white hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-blue-500 py-1 px-2 rounded"> Update </button>
			                
			                    <button @click="cancelEdit" class="flex-shrink-0 border-transparent border-4 text-blue-500 hover:text-blue-800 text-sm py-1 px-2 rounded"> Cancel </button>    
			                </div>
			            </div>
			        </form>

			        <div v-for="(category, index) in categories" :key="category.id">
			            <CategoryCard :category="category" :index="index"/>
			        </div>
			    </div>
			</template>

			<script>
			    import CategoryCard from '../extras/CategoryCard'

			    export default {
			        name: 'CategoryCRUD',

			        components: {CategoryCard},

			        data() {
			            return {
			                categoryForm: {
			                    name: null
			                },
			                categories: '',
			                errors: {},
			                editMode: false,
			                category: null
			            }
			        },

			        created() {
			            this.listen()

			            axios.get('/api/categories')
			                .then(res => this.categories = res.data.data)
			                .catch(errors =>errors.response.data)
			        },

			        methods: {
			            submitCategory() {
			                this.editMode == true ? this.updateCategory() : this.createCategory()
			            },

			            createCategory() {
			                axios.post('/api/categories', this.categoryForm)
			                    .then(res => {
			                        this.categories.unshift(res.data.data)
			                        this.categoryForm.name = null
			                    })
			                    .catch(error => this.errors = error.response.data.error)
			            },

			            updateCategory() {
			                axios.put(`/api/categories/${this.category.slug}`,  this.categoryForm)
			                    .then(res => {
			                        this.categories.unshift(res.data.data)
			                        this.categoryForm.name = null
			                        this.editMode = false
			                    })
							    .catch(error => console.log(error))
			            },

			            cancelEdit() {
			                this.editMode = false
			                this.categories.unshift(this.category)
			                this.categoryForm.name = null
			            },

			            listen() {
			                EventBus.$on('changingEditMode', (index) => {
			                    this.categoryForm.name = this.categories[index].name
			                    this.category = this.categories[index]
			                    this.categories.splice(index,1)
			                    this.editMode = true
			                })

			                EventBus.$on('deletingCategory', (index) => {
			                    axios.delete(`/api/categories/${this.categories[index].slug}`)
			                        .then(res => this.categories.splice(index, 1))
			                        .catch(error => console.log(error))
			                })
			            }
			        }
			    }
			</script>

			<style>

			</style>

	[7.7] Reply Components
		#resources->js->components->reply->CreateReply.vue
			<template>
			    <div class="my-10">
			        <form class="flex items-stretch m-3" @submit.prevent="createReply">
			            <ImageCircle :name="user.name" :avatar="user.avatar"/>

			            <div class="flex flex-col w-full">
			                <p class="ml-2 font-semibold text-md text-blue-600">{{user.name}}</p>
			                
			                <textarea v-model="replyForm.body" type="text" class="w-4/6 mx-2 my-2 shadow-inner p-4 border border-gray-500" placeholder="Enter your reply here..." rows="3"></textarea>
			                
			                <button type="submit" class="w-24 mt-4 ml-1 uppercase rounded-lg shadow-2xl border border-gray-500 text-xs text-gray-900 bg-white hover:border-blue-700 hover:text-blue-700 font-semibold py-2 px-2 focus:outline-none"><i class="fas fa-reply"></i> Reply</button>
			            </div>
			        </form>
			    </div>
			</template>

			<script>
			    import ImageCircle from '../extras/ImageCircle'

			    export default {
			        name: 'CreateReply',

			        components: {ImageCircle},

			        data() {
			            return {
			                replyForm: {
			                    body: ''
			                },
			                errors: {},
			                user: ''
			            }
			        },

			        created() {
			            if(User.loggedIn()) {
			                axios.post('/api/auth/me')
			                    .then(res => this.user = res.data)
			                    .catch(errors => console.log(errors))
			            }
			        },

			        methods: {
			            createReply() {
			                axios.post(`/api/questions/${this.$route.params.slug}/replies`, this.replyForm)
			                    .then(res => {
			                        this.replyForm.body = ''
			                        EventBus.$emit('creatingReply', res.data.data)
			                        EventBus.$emit('changingMaxRepliesCount')
			                    })
			                    .catch(error => this.errors = error.response.data.error)
			            }
			        }
			    }
			</script>

			<style>

			</style>

	[7.8] User Components
		#resources->js->components->user->UserQuestions.vue
			<template>
			    <div class="flex w-full">
			        
			        <div class="w-4/6">
			            <div v-for="question in questions" :key="question.id">
			                <QuestionCard :question="question"/>
			            </div>
			        </div>
			       
			        <div class="flex justify-center pt-3">
			            <ProfileCard :user="user"/>
			        </div>
			    </div>
			</template>

			<script>
			    import QuestionCard from '../extras/QuestionCard'
			    import ProfileCard from '../extras/ProfileCard'

			    export default {
			        name: 'UserQuestions',

			        components: {QuestionCard, ProfileCard},

			        data() {
			            return {
			                user: '',
			                questions: ''
			            }
			        },

			        created() {
			             axios.get(`/api/users/${this.$route.params.id}`)
			                .then(res => {
			                    this.user = res.data.data
			                    this.questions = res.data.data.questions
			                })
			                .catch(errors => console.log(errors))
			        }
			    }
			</script>

			<style>

</style>

		#resources->js->components->user->EditUser.vue
			<template>
			    <div class="w-full my-6 flex justify-center">
			        <form @submit.prevent="editUser" class="px-8 pt-6 pb-8 mb-4 w-2/6 bg-white shadow-md rounded justify-center absolute">
			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">Name</label>
			                
			                <input v-if="userForm.name" v-model="userForm.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="User Name">
			                
			                <span v-if="errors.name" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.name[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Birthday</label>
			                
			                <input v-model="userForm.birthday" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="birthday" placeholder="mm/dd/yyyy">
			            
			                <span v-if="errors.birthday" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.birthday[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Email</label>
			                
			                <input v-model="userForm.email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="user@email.com">

			                <span v-if="errors.email" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.email[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Confirm Password</label>
			                
			                <input v-model="userForm.password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="Confirm password ****">
			            
			                <span v-if="errors.password" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.password[0]}}
			                </span>
			            </div>

			            <ImageUpload/>

			            <div class="flex pt-4 items-center justify-between">
			                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
			                    Save
			                </button>
			            </div>
			        </form>
			    </div>
			</template>

			<script>
			    import ImageUpload from '../extras/ImageUpload'

			    export default {
			        name: 'EditUser',

			        data() {
			            return {
			                userForm: {
			                    name: '',
			                    birthday: '',
			                    email: '',
			                    password: '',
			                    avatar: null           
			                },
			                user: '',
			                errors: {},
			            }
			        },

			        components: {ImageUpload},

			        created() {
			            this.listen()
			            this.me()
			        },

			        methods: {
			            me() {
			                axios.post('/api/auth/me')
			                    .then(res => {
			                        this.user = res.data
			                        this.userForm = this.user
			                        this.userForm.birthday = this.userForm.birthday.substr(0,10) //Because birthday contains timestamp as well
			                    })
			                    .catch(errors => console.log(errors))
			            },

			            listen() {
			                EventBus.$on('uploadingImage', (uploadedImage) => {
			                    this.userForm.avatar = uploadedImage
			                })
			            },

			            editUser() {
			                axios.put(`/api/users/${this.user.id}`, this.userForm)
			                    .then(res => window.location = '/')
			                    .catch(errors => this.errors = errors.response.data.errors)
			            },
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->user->FavouriteQuestions.vue
			<template>
			    <div class="flex justify-center">
			        <div class="w-4/6">
			            <div v-for="question in questions" :key="question.id">
			                <QuestionCard :question="question"/>
			            </div>
			        </div>

			        <div class="w-2/6">
			            <div class="flex flex-wrap justify-center">
			                <div v-for="category in categories" :key="category.id">
			                    <CategoryBox :category="category"/>
			                </div>
			            </div>
			        </div>  
			    </div>
			</template>

			<script>
			    import QuestionCard from '../extras/QuestionCard'
			    import CategoryBox from '../extras/CategoryBox'

			    export default {
			        name: 'FavouriteQuestions',

			        components: {QuestionCard, CategoryBox},

			        data() {
			            return {
			                questions: '',
			                categories: ''
			            }
			        },

			        created() {
			            axios.get('api/favourites')
			                .then(res => this.questions = res.data.data)
			                .catch(errors => console.log(errors))

			            axios.get('api/categories')
			                .then(res => this.categories = res.data.data)
			                .catch(errors => console.log(errors))
			        }
			    }
			</script>

			<style>

			</style>



8) Upload User Image
	[8.1] Display on frontend
		#resources->js->components->extras->ImageUpload.vue
			<template>
			    <div>
			        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Profile Picture</label>

			        <input type="file" name='image' @change="getImage" class="py-2">

			        <div v-if="uploadedImage != null" class="text-center">
			            <img class="w-32 h-32 mx-auto mb-2 object-cover rounded-full" :src="uploadedImage" alt="Profile Pic">
			    
			            <i class="fas fa-upload mr-1"></i>
			            <button @click.prevent="uploadImage">Upload</button>

			            
			            <i class="fas fa-trash-alt ml-5 mr-1"></i>
			            <button @click.prevent="removeImage">Delete</button>
			        </div>

			        <div v-if="message" class="text-center mt-2 text-blue-700">
			            {{message}}
			        </div>
			    </div>
			</template/>

			<script>
			    export default {
			        name: 'ImageUpload',

			        data() {
			            return {
			                uploadedImage: null,
			                message: null
			            }
			        },

			        created() {
			            axios.post('/api/auth/me')
			                .then(res => this.uploadedImage = res.data.avatar)
			                .catch(errors => console.log(errors))
			        },

			        methods: {
			            getImage(e) {
			                let image = e.target.files[0]
			                let reader = new FileReader()

			                reader.readAsDataURL(image)
			                reader.onload = e => {
			                    this.uploadedImage = e.target.result
			                }
			            },

			            uploadImage() {
			                this.message = 'Profile picture is uploaded successfully!'
			                EventBus.$emit('uploadingImage', this.uploadedImage)
			            },

			            removeImage() {
			                this.uploadedImage = null
			                this.message = 'Profile picture is deleted successfully!'
			                EventBus.$emit('uploadingImage', this.uploadedImage)
			            }
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->auth->Register.vue
			<template>
			    <div class="w-full justify-center flex">
			        <div class="bg-white w-96 absolute rounded-lg shadow-2xl p-6 my-4">

			            <h1 class="text-3xl pt-6 text-blue-800">Welcome Back</h1>
			            <h2 class="text-base text-gray-700">Enter your details below!</h2>

			            <form class="mt-8" @submit.prevent="register">

			                <div class="relative mb-4">
			                    <label for="name" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Name</label>

			                    <input v-model="registerForm.name" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Register your name">

			                    <span v-if="errors.name" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.name[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-4">
			                    <label for="birthday" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Birthday</label>

			                    <input v-model="registerForm.birthday" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="mm/dd/yyyy">

			                    <span v-if="errors.birthday" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.birthday[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-4">
			                    <label for="email" class="uppercase text-blue-800 text-xs font-bold absolute p-2">E-mail</label>

			                    <input v-model="registerForm.email" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="email" placeholder="Register your email">

			                    <span v-if="errors.email" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.email[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-4">
			                    <label for="password" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Password</label>

			                    <input v-model="registerForm.password" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="password" placeholder="Enter your password">

			                    <span v-if="errors.password" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.password[0]}}
			                    </span>
			                </div>

			                <div class="relative mb-6">
			                    <label for="password_confirmation" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Password</label>

			                    <input v-model="registerForm.password_confirmation" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="password" placeholder="Confirm your password">
			                </div>

			                <ImageUpload/>

			                <div class="flex justify-center">
			                    <button type="submit" class="mt-4 uppercase rounded-lg shadow-2xl border border-blue-800 bg-transparent text-blue-800 hover:bg-gray-100 hover:text-gray-100 hover:bg-blue-800 focus:outline-none font-semibold py-2 px-4">
			                        Register
			                    </button>
			                </div>
			            </form>
			        </div>
			    </div>
			</template>

			<script>
			    import ImageUpload from '../extras/ImageUpload'

			    export default {
			        name: "Register",

			        components: {ImageUpload},

			        data() {
			            return {
			                registerForm: {
			                    name: null,
			                    birthday: null,
			                    email: null,
			                    password: null,
			                    password_confirmation: null,
			                    avatar: null
			                },
			                errors: {}
			            }
			        },

			        created() {
			            this.listen()
			        },

			        methods: {
			            register() {
			                 axios.post('/api/auth/signup', this.registerForm)
			                    .then(res => User.responseAfterLogin(res))
			                    .catch(error => this.errors = error.response.data.errors)
			            },

			            listen() {
			                EventBus.$on('uploadingImage', (uploadedImage) => {
			                    this.registerForm.avatar = uploadedImage
			                })
			            }

			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->user->EditUser.vue
			<template>
			    <div class="w-full my-6 flex justify-center">
			        <form @submit.prevent="editUser" class="px-8 pt-6 pb-8 mb-4 w-2/6 bg-white shadow-md rounded justify-center absolute">
			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">Name</label>
			                
			                <input v-if="userForm.name" v-model="userForm.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="User Name">
			                
			                <span v-if="errors.name" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.name[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Birthday</label>
			                
			                <input v-model="userForm.birthday" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="birthday" placeholder="mm/dd/yyyy">
			            
			                <span v-if="errors.birthday" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.birthday[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Email</label>
			                
			                <input v-model="userForm.email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="user@email.com">

			                <span v-if="errors.email" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.email[0]}}
			                </span>
			            </div>

			            <div class="mb-4">
			                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Confirm Password</label>
			                
			                <input v-model="userForm.password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="Confirm password ****">
			            
			                <span v-if="errors.password" class="text-red-700 pt-1 text-sm" role="alert">
			                        {{errors.password[0]}}
			                </span>
			            </div>

			            <ImageUpload/>

			            <div class="flex pt-4 items-center justify-between">
			                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
			                    Save
			                </button>
			            </div>
			        </form>
			    </div>
			</template>

			<script>
			    import ImageUpload from '../extras/ImageUpload'

			    export default {
			        name: 'EditUser',

			        data() {
			            return {
			                userForm: {
			                    name: '',
			                    birthday: '',
			                    email: '',
			                    password: '',
			                    avatar: null           
			                },
			                user: '',
			                errors: {},
			            }
			        },

			        components: {ImageUpload},

			        created() {
			            this.listen()
			            this.me()
			        },

			        methods: {
			            me() {
			                axios.post('/api/auth/me')
			                    .then(res => {
			                        this.user = res.data
			                        this.userForm = this.user
			                        this.userForm.birthday = this.userForm.birthday.substr(0,10) //Because birthday contains timestamp as well
			                    })
			                    .catch(errors => console.log(errors))
			            },

			            listen() {
			                EventBus.$on('uploadingImage', (uploadedImage) => {
			                    this.userForm.avatar = uploadedImage
			                })
			            },

			            editUser() {
			                axios.put(`/api/users/${this.user.id}`, this.userForm)
			                    .then(res => window.location = '/')
			                    .catch(errors => this.errors = errors.response.data.errors)
			            },
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->ImageCircle.vue
			<template>
			    <div>
			        <div v-if="userImage != null">
			            <img class="w-10 h-10 mx-auto object-cover rounded-full" :src="avatar" alt="Profile Pic">
			        </div>
			        
			        <div v-else class="rounded-full text-white bg-blue-400 w-10 h-10 border border-gray-300 flex justify-center items-center">
			            {{userName}}    
			        </div>
			    </div>
			</template>

			<script>
			    export default {
			        name: 'ImageCircle',

			        props: [
			            'name', 'avatar'
			        ],

			        computed: {
			            userName() {
			                if(this.name) {
			                    if(this.name.length > 1) {
			                        return this.name.match(/[A-Z]/g).slice(0, 2).join('')
			                    }

			                    return '?'
			                }
			            },

			            userImage() {
			                return this.avatar
			            }
			        }
			    }
			</script>

			<style>

			</style>


9) Perform Search
	/*TNTSearch will scan the whole table which is why it will give us email as well along with username. 
	It should be done on tables like category so that we could directly use Category::search() in the model.*/
	[9.1] Installation and Setup 
		#Follow instructions from the Laravel Docs
			composer require laravel/scout

			php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"

		#Install tntsearch package by following the installation Docs
			https://github.com/teamtnt/laravel-scout-tntsearch-driver

			composer require teamtnt/laravel-scout-tntsearch-driver

 		#Change the congif driver to tntsearch from algolia
 			#config->scout.php
 				<?php

			return [

			    'driver' => env('SCOUT_DRIVER', 'tntsearch'),

			    'prefix' => env('SCOUT_PREFIX', ''),

			    'queue' => env('SCOUT_QUEUE', false),

			    'chunk' => [
			        'searchable' => 500,
			        'unsearchable' => 500,
			    ],

			    'soft_delete' => false,

			    'algolia' => [
			        'id' => env('ALGOLIA_APP_ID', ''),
			        'secret' => env('ALGOLIA_SECRET', ''),
			    ],

			    'tntsearch' => [
			        'storage'  => storage_path(), //place where the index files will be stored
			        'fuzziness' => env('TNTSEARCH_FUZZINESS', true),
			        'fuzzy' => [
			            'prefix_length' => 2,
			            'max_expansions' => 50,
			            'distance' => 2
			        ],
			        'asYouType' => false,
			        'searchBoolean' => env('TNTSEARCH_BOOLEAN', false),
			    ],
			];

		#Prevent search from being commited got git repo
			#.gitgnore
				'/storage/*.index' (without'')

	[9.2] Backend operations
		#Add use Seachable in the Model
			<?php

			namespace App;

			use Illuminate\Contracts\Auth\MustVerifyEmail;
			use Illuminate\Foundation\Auth\User as Authenticatable;
			use Illuminate\Notifications\Notifiable;
			use Tymon\JWTAuth\Contracts\JWTSubject;
			use Laravel\Scout\Searchable;

			use App\Question;
			use App\Reply;
			use Carbon\Carbon;


			class User extends Authenticatable implements JWTSubject
			{

			    use Notifiable; //For Jwt

			    use Searchable; //For Scout

			    public function toSearchableArray() //For Scout if you get mb_strtolower() expects parameter 1 to be string, array given in Tokenizer.php error
			    {
			        return [];
			    }

			    protected $fillable = [
			        'name', 'email', 'password', 'birthday', 'avatar'
			    ];

			    protected $hidden = [
			        'password', 'remember_token',
			    ];

			    protected $casts = [
			        'email_verified_at' => 'datetime',
			    ];

			    public function getJWTIdentifier()
			    {
			        return $this->getKey();
			    }

			    public function getJWTCustomClaims()
			    {
			        return [];
			    }

			    public function setPasswordAttribute($value)
			    {
			        $this->attributes['password'] = bcrypt($value);
			    }

			    protected $dates = ['birthday'];

			    public function setBirthdayAttribute($birthday)
			    {
			        $this->attributes['birthday'] = Carbon::parse($birthday);
			    }

			    protected $with = ['questions'];

			    public function questions()
			    {
			        return $this->hasMany(Question::class);
			    }

			    public function replies()
			    {
			        return $this->hasMany(Reply::class);
			    }
			}

		#Import scout in the database and make Controller and Route
			php artisan scout:import \\App\\User

				#OR

			php artisan tntsearch:import \\App\\User

			php artisan make:controller SearchController

			#Add index function in the controller
				#app->Http->Controllers->SearchController
					<?php

					namespace App\Http\Controllers;

					use Illuminate\Http\Request;
					use App\Http\Resources\UserResource;
					use App\User;

					class SearchController extends Controller
					{
					    public function getUsers(Request $request)
					    {
					        $myString = $request->searchTerm;

					        $searchResult = User::select()->where('name', 'like', "%$myString%")->get();
					            
					        return UserResource::collection($searchResult);

					        /* //If want to get search from the whole table which also includes email
					            $searchResult = User::search($request->searchTerm)->where('user_id', request()->user()->id)->get();
					        	
					        	return UserResource::collection($searchResult);
							*/
					    }
					}
					/*Postman
						Post->http://127.0.0.1:8000/api/search
							Body:
								searchTerm: jo */

			#Add search route in the api
				#routes->api.php
					<?php

					use Illuminate\Http\Request;
					use Illuminate\Support\Facades\Route;

					Route::middleware('auth:api')->get('/user', function (Request $request) {
					    return $request->user();
					});

					Route::group([

					    'middleware' => 'api',
					    'prefix' => 'auth'

					], function ($router) {

					    Route::post('login', 'AuthController@login');
					    Route::post('signup', 'AuthController@signup');
					    Route::post('logout', 'AuthController@logout');
					    Route::post('refresh', 'AuthController@refresh');
					    Route::post('me', 'AuthController@me');

					});

					//CRUD
					Route::apiResource('/users', 'UserController');

					Route::apiResource('/questions', 'QuestionController');

					Route::apiResource('/categories', 'CategoryController');

					Route::apiResource('/questions/{question}/replies', 'ReplyController');


					//LIKE
					Route::post('/replies/{reply}/like', 'LikeController@likeIt');
					Route::delete('/replies/{reply}/like', 'LikeController@unlikeIt');


					//FAVOURITE
					Route::get('/favourites', 'FavouriteController@getQuestions');
					Route::post('/questions/{question}/favourite', 'FavouriteController@favouriteIt');
					Route::delete('/questions/{question}/favourite', 'FavouriteController@unfavouriteIt');


					//SEARCH
					Route::post('/search', 'SearchController@getUsers');


					//NOTIFICATIONS
					Route::post('/notifications', 'NotificationController@index');
					Route::post('/markasread', 'NotificationController@markAsRead');


					//COUNT
					Route::post('/maximumreplies', 'CountController@maxReplies');
					Route::post('/maximumquestions', 'CountController@maxQuestions');
					Route::post('/thismonthquestions', 'CountController@thisMonthQuestions');

	[9.3] Frontend operations
		#resources->js->components->SearchBar.vue
			<template>
			    <div class="flex justify-end items-center">
			        <div v-if="userLoggedIn"><Notifications/></div>

			        <SearchTab/>

			        <ImageCircle :name="userName" :avatar="userImage"/>
			    </div>
			</template>

			<script>
			    import SearchTab from './extras/SearchTab'
			    import ImageCircle from './extras/ImageCircle'
			    import Notifications from './extras/Notifications'

			    export default {
			        name: "SearchBar",

			        components: {ImageCircle, SearchTab, Notifications},

			        data() {
			            return {
			                userImage: null,
			            }
			        },

			        created() {
			            if(User.loggedIn()) {
			                axios.post('/api/auth/me')
			                    .then(res => this.userImage = res.data.avatar)
			            } 
			        },

			        computed: {
			            userName() {
			                if(User.loggedIn()) {
			                    return User.name()
			                }

			                return '?'
			            },

			            userLoggedIn() {
			                return User.loggedIn()
			            }
			        },
			    }
			</script>

			<style scoped>

			</style>
		
		#resources->js->components->SearchTab.vue
			<template>
			    <div>
			        <div v-if="focus" @click="focus = false" class="bg-black absolute opacity-25 right-0 left-0 top-0 bottom-0 z-10"></div>

			        <div class="relative z-10">
			            <div class="absolute"><i class="fa fa-search pt-2 pl-2 text-3xl fill-current text-gray-700"></i></div>
			            
			            <input type="text" id="searchTerm" v-model="searchTerm" @input="searchUsers" @focus="focus = true" placeholder="Search the user" class="rounded-full w-64 border border-gray-400 pl-10 p-2 mr-3 focus:outline-none text-sm text-black focus:shadow focus:border-blue-600">
			            
			            <div v-if="focus" class="absolute bg-white rounded-lg w-96 right-0 mr-6 mt-2 shadow z-20">
			                <div v-if="searchResult.length == 0" class="p-2">No Result found for '{{searchTerm}}'</div>

			                <div v-for="result in searchResult" :key='result.id' @click="focus=false">
			                    <router-link :to="'/users/' + result.id" class="flex items-center rounded-lg p-2 border-b border-gray-100 hover:bg-gray-100 hover:border-blue-500">
			                        <ImageCircle :name="result.name" :avatar="result.avatar" class="mr-3"/>
			                        
			                        {{result.name}}
			                    </router-link>
			                </div>
			            </div>
			        </div>
			    </div>
			</template>

			<script>
			    import _ from 'lodash';
			    import ImageCircle from './ImageCircle'

			    export default {
			        name: 'SearchTab',

			        components: {ImageCircle},

			        data() {
			            return {
			                searchTerm: null,
			                searchResult: '',
			                focus: false
			            }
			        },

			        methods: {
			            searchUsers: _.debounce(function (e) {
			                if(this.searchTerm.length < 2) {
			                    return
			                }

			                axios.post('/api/search', {searchTerm: this.searchTerm})
			                    .then(res => {
			                        this.searchResult = res.data.data;
			                        this.focus = true;
			                        console.log(this.searchResult.length)
			                    })
			                    .catch(errors => {
			                        console.log(errors)
			                    })
			            }, 500)
			        }
			    }
			</script>

			<style>

			</style>



10) Perform Notifications
	[10.1] Create notification system
		#Make notification using Laravel documentation
			php artisan make:notification ReplyNotification

			php artisan make:notification LikeNotification

			php artisan notifications:table
				#database->migrations->notifications //It is created automatically. Just cange the 'data' type to longText
					Schema::create('notifications', function (Blueprint $table) {
			            $table->uuid('id')->primary();
			            $table->string('type');
			            $table->morphs('notifiable');
			            $table->longText('data');
			            $table->timestamp('read_at')->nullable();
			            $table->timestamps();
			        });

			php artisan migrate

	[10.2] Backend Operations
		#Catch new reply/like in ReplyNotification/LikeNotification and return array in database
			#app->Notifications->ReplyNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				use App\Reply;

				class ReplyNotification extends Notification
				{
				    use Queueable;

				    public function __construct(Reply $reply)
				    {
				        $this->reply = $reply;
				    }

				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    public function toArray($notifiable)
				    {
				        return [
				            'user_name' => $this->reply->user->name,
				            'user_avatar' => $this->reply->user->avatar,
				            'questionOrReply' => $this->reply->question->title,
				            'path' => $this->reply->question->path,
				            'message' => 'replied on your post.'
				        ];
				    }
				}

			#app->Notifications->LikeNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				use App\Reply;

				class LikeNotification extends Notification
				{
				    use Queueable;

				    public function __construct(Reply $reply)
				    {
				        $this->reply = $reply;
				    }

				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    public function toArray($notifiable)
				    {
				        return [
				            'user_name' => $this->reply->user->name,
				            'user_avatar' => $this->reply->user->avatar,
				            'questionOrReply' => $this->reply->body,
				            'path' => $this->reply->question->path,
				            'message' => 'has liked your reply.'
				        ];
				    }
				}

		#Wrap the NotificationReply in a NotificationResource //Because created_at is outside the data{} which is the array of ReplyNotification
			php artisan make:resource NotificationResource

			#NotificationResource
				public function toArray($request)
			    {
			        return [
			            'id' => $this->id,
			            'user_name' => $this->data['user_name'],
			            'user_avatar' => $this->data['user_avatar'],
			            'questionOrReply' => $this->data['questionOrReply'],
			            'path' => $this->data['path'],
			            'message' => $this->data['message'],
			            'created_at' => $this->created_at->diffForHumans()
			        ];
			    }

		#Make changes Controllers
			#ReplyController
				<?php

				namespace App\Http\Controllers;

				use App\Reply;
				use App\Question;

				use Illuminate\Http\Request;
				use App\Http\Resources\ReplyResource;
				use App\Notifications\ReplyNotification;


				class ReplyController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('JWT', ['except' => ['index', 'show']]);
				    }
				    
				    public function index(Question $question)
				    {
				        return ReplyResource::collection($question->replies);
				    }
				    
				    public function show(Question $question, Reply $reply)
				    {
				        //
				    }
				    
				    public function store(Question $question, Request $request)
				    {
				        $request['user_id'] = auth()->user()->id;

				        $reply = $question->replies()->create($request->all());

				        $user = $question->user;
				        
				        if($reply->user_id != $question->user_id) {
				            $user->notify(new ReplyNotification($reply));
				        }
				        
				        return (new ReplyResource($reply))->response()->setStatusCode(201);
				    }
				    
				    public function update(Question $question, Request $request, Reply $reply)
				    {
				        $reply->update($request->all());
				        
				        return (new ReplyResource($reply))->response()->setStatusCode(202);
				    }
				    
				    public function destroy(Question $question,Reply $reply)
				    {
				        $reply->delete();
				        
				        return response('Deleted', 204);
				    }
				}

			#LikeController
				<?php

				namespace App\Http\Controllers;

				use App\Like;
				use App\Reply;

				use Illuminate\Http\Request;
				use App\Events\LikeEvent;
				use App\Notifications\LikeNotification;


				class LikeController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('JWT');
				    }
				    
				    public function likeIt(Reply $reply)
				    {   //Creates reply
				        $reply->likes()->create([ 
				            'user_id' => auth()-> id(),
				        ]);

				        //Sends notification
				        $like = Like::orderby('created_at', 'desc')->first();
				        
				        $user = $reply->user;
				        
				        if($like->user_id != $reply->user_id) {
				            $user->notify(new LikeNotification($reply));
				        }
				    }

				    public function unlikeIt(Reply $reply)
				    {
				        $reply->likes()->where('user_id', auth()->id())->first()->delete();
				    }

				    public function getReplies(Reply $reply)
				    {
				        $likedRepliesID = Like::where('user_id', auth()->id())->pluck('reply_id');
				        $replies = Reply::find($likedRepliesID);

				        return $replies;
				    }
				}

		#Create NotificationController
			php artisan make:controller NotificationController

			#NotificationController
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
	
		#Set the notification routes
			#app->routes->api.php
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				Route::middleware('auth:api')->get('/user', function (Request $request) {
				    return $request->user();
				});

				Route::group([

				    'middleware' => 'api',
				    'prefix' => 'auth'

				], function ($router) {

				    Route::post('login', 'AuthController@login');
				    Route::post('signup', 'AuthController@signup');
				    Route::post('logout', 'AuthController@logout');
				    Route::post('refresh', 'AuthController@refresh');
				    Route::post('me', 'AuthController@me');

				});

				//CRUD
				Route::apiResource('/users', 'UserController');

				Route::apiResource('/questions', 'QuestionController');

				Route::apiResource('/categories', 'CategoryController');

				Route::apiResource('/questions/{question}/replies', 'ReplyController');


				//LIKE
				Route::post('/replies/{reply}/like', 'LikeController@likeIt');
				Route::delete('/replies/{reply}/like', 'LikeController@unlikeIt');


				//FAVOURITE
				Route::get('/favourites', 'FavouriteController@getQuestions');
				Route::post('/questions/{question}/favourite', 'FavouriteController@favouriteIt');
				Route::delete('/questions/{question}/favourite', 'FavouriteController@unfavouriteIt');


				//SEARCH
				Route::post('/search', 'SearchController@getUsers');


				//NOTIFICATIONS
				Route::post('/notifications', 'NotificationController@index');
				Route::post('/markasread', 'NotificationController@markAsRead');


				//COUNT
				Route::post('/maximumreplies', 'CountController@maxReplies');
				Route::post('/maximumquestions', 'CountController@maxQuestions');
				Route::post('/thismonthquestions', 'CountController@thisMonthQuestions');

	[10.3] Frontend Operations
		#resources->js->components->SearchBar.vue
			<template>
			    <div class="flex justify-end items-center">
			        <div v-if="userLoggedIn"><Notifications/></div>

			        <SearchTab/>

			        <ImageCircle :name="userName" :avatar="userImage"/>
			    </div>
			</template>

			<script>
			    import SearchTab from './extras/SearchTab'
			    import ImageCircle from './extras/ImageCircle'
			    import Notifications from './extras/Notifications'

			    export default {
			        name: "SearchBar",

			        components: {ImageCircle, SearchTab, Notifications},

			        data() {
			            return {
			                userImage: null,
			            }
			        },

			        created() {
			            if(User.loggedIn()) {
			                axios.post('/api/auth/me')
			                    .then(res => this.userImage = res.data.avatar)
			            } 
			        },

			        computed: {
			            userName() {
			                if(User.loggedIn()) {
			                    return User.name()
			                }

			                return '?'
			            },

			            userLoggedIn() {
			                return User.loggedIn()
			            }
			        },
			    }
			</script>

			<style scoped>

			</style>

		#resources->js->components->extras->Notifications.vue
			<template>
			    <div class="relative">
			        <button @click="isOpen = !isOpen" class="flex block focus:outline-none items-center">
			            <div :class="color">
			                <i class="fas fa-bell text-2xl mr-3"></i>
			            </div>

			            <p class="mr-5">{{unreadCount}}</p>
			        </button>
			        
			        <div v-if="isOpen" @click="isOpen = false" class="fixed bg-black opacity-25 right-0 left-0 top-0 bottom-0"></div>

			        <div v-if="isOpen" class="absolute right-0 mt-4 w-96 shadow-xl bg-white">
			            <div v-for="item in unread" :key="item.id" class="py-3 px-3 border-b border-gray-300 bg-blue-100 hover:bg-white border-b hover:border-blue-500">
			                <NotificationCard :item="item"/>
			            </div>

			            <div v-for="item in read" :key="item.id" class="py-3 px-3 border-b border-gray-300 hover:bg-blue-100 border-b hover:border-blue-500">
			                <NotificationCard :item="item"/>
			            </div>
			        </div>
			    </div>
			</template>

			<script>
			    import NotificationCard from './NotificationCard'

			    export default {
			        name: "Notifications",

			        components: {NotificationCard},

			        data() {
			            return {
			                isOpen: false,
			                read: {},
			                unread: {},
			                unreadCount: null
			            }
			        },

			        computed: {
			            color() {
			                return this.unreadCount > 0 ? 'text-blue-500' : 'text-gray-600';
			            }
			        },

			        created() {
			            this.listen()

			            if(User.loggedIn()) {
			                this.getUnread()
			            }
			        },

			        methods: {
			            getUnread() {
			                axios.post('/api/notifications')
			                    .then(res => {
			                        this.read = res.data.read
			                        this.unread = res.data.unread
			                        this.unreadCount = res.data.unread.length
			                    })
			            },

			            listen() {
			                EventBus.$on('markingRead', (notification) => {
			                    this.isOpen = false

			                    if(this.read.includes(notification)) {
			                        //
			                    } else {
			                        axios.post('/api/markasread', {id: notification.id})
			                            .then(res => {
			                                this.unread.splice(notification, 1)
			                                this.read.push(notification)
			                                this.unreadCount --
			                            })
			                    } 
			                })
			            },
			        }
			    }
			</script>

			<style>

			</style>

		#resources->js->components->extras->NotificationCard.vue
			<template>
			    <div>
			        <div class="flex" @click="markRead">
			            <ImageCircle :name="item.user_name" :avatar="item.user_avatar"/>

			            <router-link :to="item.path" class="flex-col ml-2 w-64">
			                <p class="text-sm font-normal"><span class="text-sm font-semibold text-blue-500">{{item.user_name}}</span> {{item.message}}</p>
			            </router-link>

			            <p class="w-32 mt-1 text-xs font-light text-gray-600 text-right">{{item.created_at}}</p>
			        </div>
			        
			        <p class="ml-12 text-xs font-normal text-gray-700 mt-2">{{item.questionOrReply}}</p>
			    </div>
			</template>

			<script>
			    import ImageCircle from './ImageCircle'

			    export default {
			        name: 'NotificationCard',

			        components: {ImageCircle},

			        props: ['item'],

			        methods: {
			            markRead() {
			                EventBus.$emit('markingRead', (this.item))
			            },
			        }
			    }
			</script>

			<style>

			</style>



11) Pusher
	[11.1] Installation
		#Install Pusher from the Lara Docs using composer
			composer require pusher/pusher-php-server "~4.0"

		#Sign-up Pusher.com->create app
			#Set broadcast driver to Pusher in .env
				BROADCAST_DRIVER=pusher

			#Copy App Keys details to the .env file
				PUSHER_APP_ID=995224
				PUSHER_APP_KEY=c9a5e8ca8c9d8dfcd906
				PUSHER_APP_SECRET=7c2139ac5d7f8b6553ec
				PUSHER_APP_CLUSTER=ap4

		#Install Laravel-echo
			npm install --save laravel-echo pusher-js

		#Set-up echo in bootsrap.js
			#resources->js->bootstrap.js (Uncomment the bottom part of the file)
				window._ = require('lodash');

				window.axios = require('axios');

				window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

				//jwt Token
				const JwtToken = `Bearer ${localStorage.getItem('token')}`
				window.axios.defaults.headers.common['Authorization'] = JwtToken;


				//Pusher
				import Echo from 'laravel-echo';

				window.Pusher = require('pusher-js');

				window.Echo = new Echo({
				    broadcaster: 'pusher',
				    key: 'c9a5e8ca8c9d8dfcd906',
				    cluster: 'ap4',
				    useTLS: true,
				    auth: {
				        headers: {
				            Authorization: JwtToken
				        }
				    }
				});

		#Configure Broadcasting
			#config->broadcasting.php
				'pusher' => [
		            'driver' => 'pusher',
		            'key' => env('PUSHER_APP_KEY'),
		            'secret' => env('PUSHER_APP_SECRET'),
		            'app_id' => env('PUSHER_APP_ID'),
		            'options' => [
		                'cluster' => env('PUSHER_APP_CLUSTER'),
		                'useTLS' => true
		            ],
		        ],

			#config->app.php
				#uncomment App\Providers\BroadcastServiceProvider::class in the Providers

		#Restart the server
			php artisan config:clear
			php artisan serve

	/*As adding reply and giving like will be giving notification as well, no need to create event/channel
	and can be directly broadcasted using toBroadcast()*/
	[11.2] Create Reply Backend Operations
		#Broadcast the reply notification
			#app->Notifications->ReplyNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;
				use Illuminate\Notifications\Messages\BroadcastMessage;
				use App\Http\Resources\ReplyResource;

				use App\Reply;

				class ReplyNotification extends Notification
				{
				    use Queueable;

				    public function __construct(Reply $reply)
				    {
				        $this->reply = $reply;
				    }

				    public function via($notifiable)
				    {
				        return ['database', 'broadcast'];
				    }

				    public function toArray($notifiable)
				    {
				        return [
				            'user_name' => $this->reply->user->name,
				            'user_avatar' => $this->reply->user->avatar,
				            'questionOrReply' => $this->reply->question->title,
				            'path' => $this->reply->question->path,
				            'message' => 'replied on your post.'
				        ];
				    }

				    public function toBroadcast($notifiable)
				    {
				        return new BroadcastMessage([
				            'user_name' => $this->reply->user->name,
				            'user_avatar' => $this->reply->user->avatar,
				            'questionOrReply' => $this->reply->question->title,
				            'path' => $this->reply->question->path,
				            'message' => 'replied on your post.',
				            'reply' => new ReplyResource($this->reply)
				        ]);
				    }
				}

	[11.3] Create Reply Frontend Operations
		#Add live reply listening broadcasted message through Echo.private
			#resources->js->components->question->ShowQuestion.vue
				<template>
				    <div class="h-screen ml-4">
				        <div class="mx-3 my-6">
				            <a href="#" class="font-semibold text-blue-800 hover:text-blue-500" @click="$router.back()">
				                <i class="fas fa-angle-double-left mr-1"></i> Back
				            </a>
				        </div>
				        
				        <QuestionCard :question="question"/>

				        <div v-if="own" class="relative mx-3">
				            <button @click="editQuestion" class="mt-8 uppercase rounded-lg shadow-2xl border border-gray-300 text-xs text-gray-900 bg-white hover:border-blue-700 hover:text-blue-700 font-semibold py-2 px-3 focus:outline-none"><i class="fas fa-edit"></i> Edit</button>
				            <button @click="deleteMode = true" class="mt-8 uppercase rounded-lg shadow-2xl border border-gray-300 text-xs text-gray-900 bg-white hover:border-red-500 hover:text-red-500 font-semibold py-2 px-3 focus:outline-none"><i class="fas fa-trash"></i> Delete</button>
				        
				            <div v-if="deleteMode" class="ml-3 absolute bg-blue-900 rounded-lg text-white w-2/6 z-10 mt-2 p-3">
				                <p>Are you sure you want to delete this contact?</p>

				                <div class="flex items-center justify-end mt-3">
				                    <button @click="deleteQuestion" class="ml-6 px-4 py-2 bg-red-500 rounded text-sm">Delete</button>
				                    <button @click="deleteMode = false" class="text-sm">Cancel</button>
				                </div>
				            </div>
				        </div>

				        <CreateReply v-if="loggedIn"/>

				        <div class="ml-24 border-l-4 border-blue-500">
				            <div v-for="(reply, index) in replies" :key="reply.id" v-if="reply" class="">
				                <ReplyCard :reply="reply" :index="index"/>
				            </div>
				        </div>

				        <div v-if="deleteMode" class="bg-black opacity-25 absolute z-0 left-0 top-0 right-0 bottom-0" @click="deleteMode = false"></div>
				    </div>
				</template>

				<script>
				    import QuestionCard from '../extras/QuestionCard'
				    import ReplyCard from '../extras/ReplyCard'
				    import CreateReply from '../reply/CreateReply'

				    export default {
				        name: 'ShowQuestion',

				        components: {QuestionCard, ReplyCard, CreateReply},

				        props: ['question', 'replies'],

				        computed: {
				            own() {
				                return User.own(this.question.user_id)
				            },

				            loggedIn() {
				                return User.loggedIn()
				            }
				        },

				        data() {
				            return {
				                deleteMode:false
				            }
				        },

				        created() {
				            this.listen()
				        },

				        methods: {
				            deleteQuestion() {
				                axios.delete(`/api/questions/${this.$route.params.slug}`)
				                    .then(this.$router.push('/'))
				                    .catch(errors => console.log(errors));
				            },

				            editQuestion() {
				                EventBus.$emit('editingQuestion')
				            },

				            listen() {
				                EventBus.$on('creatingReply', (reply) => {
				                    this.replies.unshift(reply)
				                })

				                EventBus.$on('deletingReply', (index) => {
				                    this.replies.splice(index, 1)
				                })

				                Echo.private('App.User.' + User.id())
				                    .notification((notification) => {
				                        if(notification.reply) {
				                            this.question.replies.unshift(notification.reply)
				                        }
				                    });
				            },
				        },    
				    }
				</script>

				<style>

				</style>

		#Add live reply notification listening broadcasted message through Echo.private
			#resources->js->components->extra->Notifications.vue
				<template>
				    <div class="relative">
				        <button @click="isOpen = !isOpen" class="flex block focus:outline-none items-center">
				            <div :class="color">
				                <i class="fas fa-bell text-2xl mr-3"></i>
				            </div>

				            <p class="mr-5">{{unreadCount}}</p>
				        </button>
				        
				        <div v-if="isOpen" @click="isOpen = false" class="fixed bg-black opacity-25 right-0 left-0 top-0 bottom-0"></div>

				        <div v-if="isOpen" class="absolute right-0 mt-4 w-96 shadow-xl bg-white">
				            <div v-for="item in unread" :key="item.id" class="py-3 px-3 border-b border-gray-300 bg-blue-100 hover:bg-white border-b hover:border-blue-500">
				                <NotificationCard :item="item"/>
				            </div>

				            <div v-for="item in read" :key="item.id" class="py-3 px-3 border-b border-gray-300 hover:bg-blue-100 border-b hover:border-blue-500">
				                <NotificationCard :item="item"/>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import NotificationCard from './NotificationCard'

				    export default {
				        name: "Notifications",

				        components: {NotificationCard},

				        data() {
				            return {
				                isOpen: false,
				                read: {},
				                unread: {},
				                unreadCount: null
				            }
				        },

				        computed: {
				            color() {
				                return this.unreadCount > 0 ? 'text-blue-500' : 'text-gray-600';
				            }
				        },

				        created() {
				            this.listen()

				            if(User.loggedIn()) {
				                this.getUnread()
				            }
				        },

				        methods: {
				            getUnread() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                    })
				            },

				            listen() {
				                EventBus.$on('markingRead', (notification) => {
				                    this.isOpen = false

				                    if(this.read.includes(notification)) {
				                        //
				                    } else {
				                        axios.post('/api/markasread', {id: notification.id})
				                            .then(res => {
				                                this.unread.splice(notification, 1)
				                                this.read.push(notification)
				                                this.unreadCount --
				                            })
				                    } 
				                }),

				                Echo.private('App.User.' + User.id())
				                    .notification((notification) => {
				                        this.unread.unshift(notification)
				                        this.unreadCount ++
				                        //console.log(notification.type)
				                    });
				            },
				        }
				    }
				</script>

				<style>

				</style>

	[11.4] Add Like Notification Backend Operations
		#Broadcast the like notification
			#app->notifications->LikeNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;
				use Illuminate\Notifications\Messages\BroadcastMessage;
				use App\Http\Resources\ReplyResource;


				use App\Reply;

				class LikeNotification extends Notification
				{
				    use Queueable;

				    public function __construct(Reply $reply)
				    {
				        $this->reply = $reply;
				    }

				    public function via($notifiable)
				    {
				        return ['database', 'broadcast'];
				    }

				    public function toArray($notifiable)
				    {
				        return [
				            'user_name' => $this->reply->user->name,
				            'user_avatar' => $this->reply->user->avatar,
				            'questionOrReply' => $this->reply->body,
				            'path' => $this->reply->question->path,
				            'message' => 'has liked your reply.'
				        ];
				    }

				    public function toBroadcast($notifiable)
				    {
				        return new BroadcastMessage([
				            'user_name' => $this->reply->user->name,
				            'user_avatar' => $this->reply->user->avatar,
				            'questionOrReply' => $this->reply->body,
				            'path' => $this->reply->question->path,
				            'message' => 'has liked your reply.',
				        ]);
				    }
				}
	[11.5] Add Like Notification Frontend Operations
		#Add live like listening broadcasted message through Echo.private
			#resources->js->components->extra->Notifications.vue //No change in it as its the same as above
				<template>
				    <div class="relative">
				        <button @click="isOpen = !isOpen" class="flex block focus:outline-none items-center">
				            <div :class="color">
				                <i class="fas fa-bell text-2xl mr-3"></i>
				            </div>

				            <p class="mr-5">{{unreadCount}}</p>
				        </button>
				        
				        <div v-if="isOpen" @click="isOpen = false" class="fixed bg-black opacity-25 right-0 left-0 top-0 bottom-0"></div>

				        <div v-if="isOpen" class="absolute right-0 mt-4 w-96 shadow-xl bg-white">
				            <div v-for="item in unread" :key="item.id" class="py-3 px-3 border-b border-gray-300 bg-blue-100 hover:bg-white border-b hover:border-blue-500">
				                <NotificationCard :item="item"/>
				            </div>

				            <div v-for="item in read" :key="item.id" class="py-3 px-3 border-b border-gray-300 hover:bg-blue-100 border-b hover:border-blue-500">
				                <NotificationCard :item="item"/>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import NotificationCard from './NotificationCard'

				    export default {
				        name: "Notifications",

				        components: {NotificationCard},

				        data() {
				            return {
				                isOpen: false,
				                read: {},
				                unread: {},
				                unreadCount: null
				            }
				        },

				        computed: {
				            color() {
				                return this.unreadCount > 0 ? 'text-blue-500' : 'text-gray-600';
				            }
				        },

				        created() {
				            this.listen()

				            if(User.loggedIn()) {
				                this.getUnread()
				            }
				        },

				        methods: {
				            getUnread() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                    })
				            },

				            listen() {
				                EventBus.$on('markingRead', (notification) => {
				                    this.isOpen = false

				                    if(this.read.includes(notification)) {
				                        //
				                    } else {
				                        axios.post('/api/markasread', {id: notification.id})
				                            .then(res => {
				                                this.unread.splice(notification, 1)
				                                this.read.push(notification)
				                                this.unreadCount --
				                            })
				                    } 
				                }),

				                Echo.private('App.User.' + User.id())
				                    .notification((notification) => {
				                        this.unread.unshift(notification)
				                        this.unreadCount ++
				                        //console.log(notification.type)
				                    });
				            },
				        }
				    }
				</script>

				<style>

				</style>

	[11.6] Remove Like Backend Operations
		#Add an event in the EventServiceProvider
			#app->Providers->EventServiceProvider
			    protected $listen = [
			        'App\Events\RemoveLikeEvent' => [
			            'App\Listeners\RemoveLikeEventListener',
			        ],
			    ];

    	#Make like events and listeners folder in app
			php artisan event:generate (It creates the file in the Events)

		#Broadcasting events using Laravel->Broadcast to others
			#app->Http->Controllers->LikeController
				<?php

				namespace App\Http\Controllers;

				use App\Like;
				use App\Reply;

				use Illuminate\Http\Request;
				use App\Events\RemoveLikeEvent;
				use App\Notifications\LikeNotification;


				class LikeController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('JWT');
				    }
				    
				    public function likeIt(Reply $reply)
				    {   //Adds like
				        $reply->likes()->create([ 
				            'user_id' => auth()-> id(),
				        ]);

				        //Sends notification
				        $like = Like::orderby('created_at', 'desc')->first();
				        
				        $user = $reply->user;
				        
				        if($like->user_id != $reply->user_id) {
				            $user->notify(new LikeNotification($reply));
				        }
				    }

				    public function unlikeIt(Reply $reply)
				    {   //Removes Like
				        $reply->likes()->where('user_id', auth()->id())->first()->delete();

				        //Makes it live
				        broadcast(new RemoveLikeEvent($reply->id))->toOthers();
				    }

				    public function getReplies(Reply $reply)
				    {
				        $likedRepliesID = Like::where('user_id', auth()->id())->pluck('reply_id');
				        $replies = Reply::find($likedRepliesID);

				        return $replies;
				    }
				}

		#Broadcast like channel and edit construct
			#app->Events->RemoveLikeEvent
				<?php

				namespace App\Events;

				use Illuminate\Broadcasting\Channel;
				use Illuminate\Broadcasting\InteractsWithSockets;
				use Illuminate\Broadcasting\PresenceChannel;
				use Illuminate\Broadcasting\PrivateChannel;
				use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
				use Illuminate\Foundation\Events\Dispatchable;
				use Illuminate\Queue\SerializesModels;

				class RemoveLikeEvent implements ShouldBroadcast
				{
				    use Dispatchable, InteractsWithSockets, SerializesModels;

				    public $id;

				    public function __construct($id)
				    {
				        $this->id = $id;
				    }

				    public function broadcastOn()
				    {
				        return new Channel('removeLikeChannel');
				    }
				}

		#Add the likeChannel
			#routes->channels.php
				<?php

				use Illuminate\Support\Facades\Broadcast;

				Broadcast::channel('App.User.{id}', function ($user, $id) {
				    return (int) $user->id === (int) $id;
				});

				Broadcast::channel('removeLikeChannel', function () {
				    return true;
				});

		#Restart the server
			php artisan config:clear
			php artisan serve

		#Go to pusher website to check if connection is Successful
			#Open debug console of Pusher and refresh thelocal host page. The connection to the local host should be displayed.

			#Like any reply and check the debug console. It should display the data of the reply that has been liked

	[11.7] Remove Like Frontend Operations
		#listen event in the created() of Like.vue using Laravel->Receving Broadcast->Listening the event
			#resources->js->components->extra->Like.vue
				<template>
				    <div>
				        <button @click="likeIt" :class="color" class="focus:outline-none">
				            <i class="fas fa-thumbs-up ml-5"></i> {{count}}
				        </button>

				        <div v-if="message != null" class="mt-3 ml-5 text-sm text-red-500">
				            {{message}}
				        </div>
				    </div>
				</template/>

				<script>
				    export default {
				        name: 'Like',

				        props: ['reply'],

				        data() {
				            return {
				                id: this.reply.id,
				                count: this.reply.like_count,
				                liked: this.reply.liked,
				                message: null
				            }
				        },

				        computed: {
				            color() {
				                return this.liked ? 'text-green-500' : 'text-gray-700'
				            }
				        },

				        created() {
				            Echo.private('App.User.' + User.id())
				                .notification((notification) => {
				                    this.count ++
				                });

				            Echo.channel('removeLikeChannel')
				                .listen('RemoveLikeEvent', (e) => {
				                    if(this.reply.id == e.id) {
				                        this.count --
				                    }
				                });
				        },

				        methods: {
				            likeIt() {
				                if(User.loggedIn()) {
				                    this.liked ? this.removeLike() : this.addLike()
				                    this.liked = !this.liked
				                } else {
				                    this.message = "*Please Login to give a like!*"
				                }
				            },

				            addLike() {
				                axios.post(`/api/replies/${this.id}/like`)
				                    .then(res => this.count++)
				                    .catch(errors => console.log(errors))
				            },

				            removeLike() {
				                axios.delete(`/api/replies/${this.id}/like`)
				                    .then(res => this.count--)
				                    .catch(errors => console.log(errors))
				            }
				        }
				    }
				</script>

				<style>

				</style>
	
	[11.8] Remove Reply Backend Operations
		#Add an event in the EventServiceProvider
			#app->Providers->EventServiceProvider
				protected $listen = [
			        'App\Events\RemoveLikeEvent' => [
			            'App\Listeners\RemoveLikeEventListener',
			        ],

			        'App\Events\RemoveReplyEvent' => [
			            'App\Listeners\RemoveReplyEventListener',
			        ],
			    ];

    	#Make like events and listeners folder in app
			php artisan event:generate (It creates the file in the Events)

		#Broadcasting events using Laravel->Broadcast to others
			#app->Http->Controllers->ReplyController
				<?php

				namespace App\Http\Controllers;

				use App\Reply;
				use App\Question;

				use Illuminate\Http\Request;
				use App\Http\Resources\ReplyResource;
				use App\Notifications\ReplyNotification;
				use App\Events\RemoveReplyEvent;


				class ReplyController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('JWT', ['except' => ['index', 'show']]);
				    }
				    
				    public function index(Question $question)
				    {
				        return ReplyResource::collection($question->replies);
				    }
				    
				    public function show(Question $question, Reply $reply)
				    {
				        //
				    }
				    
				    public function store(Question $question, Request $request)
				    {   //Stores reply
				        $request['user_id'] = auth()->user()->id;

				        $reply = $question->replies()->create($request->all());

				        //Sends notification
				        $user = $question->user;
				        
				        if($reply->user_id != $question->user_id) {
				            $user->notify(new ReplyNotification($reply));
				        }
				        
				        return (new ReplyResource($reply))->response()->setStatusCode(201);
				    }
				    
				    public function update(Question $question, Request $request, Reply $reply)
				    {
				        $reply->update($request->all());
				        
				        return (new ReplyResource($reply))->response()->setStatusCode(202);
				    }
				    
				    public function destroy(Question $question,Reply $reply)
				    {
				        $reply->delete();

				        //Makes it live
				        broadcast(new RemoveReplyEvent($reply->id))->toOthers();
				        
				        return response('Deleted', 204);
				    }
				}

		#Broadcast like channel and edit construct
			#app->Events->RemoveReplyEvent
				<?php

				namespace App\Events;

				use Illuminate\Broadcasting\Channel;
				use Illuminate\Broadcasting\InteractsWithSockets;
				use Illuminate\Broadcasting\PresenceChannel;
				use Illuminate\Broadcasting\PrivateChannel;
				use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
				use Illuminate\Foundation\Events\Dispatchable;
				use Illuminate\Queue\SerializesModels;

				class RemoveReplyEvent implements ShouldBroadcast
				{
				    use Dispatchable, InteractsWithSockets, SerializesModels;

				    public $id;

				    public function __construct($id)
				    {
				        $this->id = $id;
				    }

				    public function broadcastOn()
				    {
				        return new Channel('removeReplyChannel');
				    }
				}

		#Add the likeChannel
			#routes->channels.php
				<?php

				use Illuminate\Support\Facades\Broadcast;

				Broadcast::channel('App.User.{id}', function ($user, $id) {
				    return (int) $user->id === (int) $id;
				});

				Broadcast::channel('removeLikeChannel', function () {
				    return true;
				});

				Broadcast::channel('removeReplyChannel', function () {
				    return true;
				});

		#Restart the server
			php artisan config:clear
			php artisan serve

		#Go to pusher website to check if connection is Successful
			#Open debug console of Pusher and refresh thelocal host page. The connection to the local host should be displayed.

			#Like any reply and check the debug console. It should display the data of the reply that has been liked

	[11.9] Remove Like Frontend Operations
		#listen event in the created() of ShowQuestion.vue using Laravel->Receving Broadcast->Listening the event
			#resources->js->components->extra->ShowQuestion.vue
				<template>
				    <div class="h-screen ml-4">
				        <div class="mx-3 my-6">
				            <a href="#" class="font-semibold text-blue-800 hover:text-blue-500" @click="$router.back()">
				                <i class="fas fa-angle-double-left mr-1"></i> Back
				            </a>
				        </div>
				        
				        <QuestionCard :question="question"/>

				        <div v-if="own" class="relative mx-3">
				            <button @click="editQuestion" class="mt-8 uppercase rounded-lg shadow-2xl border border-gray-300 text-xs text-gray-900 bg-white hover:border-blue-700 hover:text-blue-700 font-semibold py-2 px-3 focus:outline-none"><i class="fas fa-edit"></i> Edit</button>
				            <button @click="deleteMode = true" class="mt-8 uppercase rounded-lg shadow-2xl border border-gray-300 text-xs text-gray-900 bg-white hover:border-red-500 hover:text-red-500 font-semibold py-2 px-3 focus:outline-none"><i class="fas fa-trash"></i> Delete</button>
				        
				            <div v-if="deleteMode" class="ml-3 absolute bg-blue-900 rounded-lg text-white w-2/6 z-10 mt-2 p-3">
				                <p>Are you sure you want to delete this contact?</p>

				                <div class="flex items-center justify-end mt-3">
				                    <button @click="deleteQuestion" class="ml-6 px-4 py-2 bg-red-500 rounded text-sm">Delete</button>
				                    <button @click="deleteMode = false" class="text-sm">Cancel</button>
				                </div>
				            </div>
				        </div>

				        <CreateReply v-if="loggedIn"/>

				        <div class="ml-24 border-l-4 border-blue-500">
				            <div v-for="(reply, index) in replies" :key="reply.id" v-if="reply" class="">
				                <ReplyCard :reply="reply" :index="index"/>
				            </div>
				        </div>

				        <div v-if="deleteMode" class="bg-black opacity-25 absolute z-0 left-0 top-0 right-0 bottom-0" @click="deleteMode = false"></div>
				    </div>
				</template>

				<script>
				    import QuestionCard from '../extras/QuestionCard'
				    import ReplyCard from '../extras/ReplyCard'
				    import CreateReply from '../reply/CreateReply'

				    export default {
				        name: 'ShowQuestion',

				        components: {QuestionCard, ReplyCard, CreateReply},

				        props: ['question', 'replies'],

				        computed: {
				            own() {
				                return User.own(this.question.user_id)
				            },

				            loggedIn() {
				                return User.loggedIn()
				            }
				        },

				        data() {
				            return {
				                deleteMode:false
				            }
				        },

				        created() {
				            this.listen()
				        },

				        methods: {
				            deleteQuestion() {
				                axios.delete(`/api/questions/${this.$route.params.slug}`)
				                    .then(this.$router.push('/'))
				                    .catch(errors => console.log(errors));
				            },

				            editQuestion() {
				                EventBus.$emit('editingQuestion')
				            },

				            listen() {
				                EventBus.$on('creatingReply', (reply) => {
				                    this.replies.unshift(reply)
				                })

				                EventBus.$on('deletingReply', (index) => {
				                    this.replies.splice(index, 1)
				                })

				                Echo.private('App.User.' + User.id())
				                    .notification((notification) => {
				                        if(notification.reply) {
				                            this.question.replies.unshift(notification.reply)
				                        }
				                    })

				                Echo.channel('removeReplyChannel')
				                    .listen('RemoveReplyEvent', (e) => {
				                        for(let index = 0; index< this.replies.length; index++) {
				                            if(this.replies[index].id == e.id) {
				                                this.replies.splice(index, 1)
				                            }
				                        }
				                    })
				            },
				        },    
				    }
				</script>

				<style>

				</style>

	[11.10] Favourite Backend Operations
		#Add an event in the EventServiceProvider
			#app->Providers->EventServiceProvider
				protected $listen = [
			        'App\Events\RemoveLikeEvent' => [
			            'App\Listeners\RemoveLikeEventListener',
			        ],

			        'App\Events\RemoveReplyEvent' => [
			            'App\Listeners\RemoveReplyEventListener',
			        ],

			        'App\Events\FavouriteEvent' => [
			            'App\Listeners\FavouriteEventListener',
			        ],
			    ];

    	#Make favourite events and listeners folder in app
			php artisan event:generate (It creates the file in the Events)

		#Broadcasting events using Laravel->Broadcast to others
			#app->Http->Controllers->FavouriteController
				<?php

				namespace App\Http\Controllers;

				use App\Favourite;
				use App\Question;

				use Illuminate\Http\Request;
				use App\Http\Resources\QuestionResource;
				use App\Events\FavouriteEvent;


				class FavouriteController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('JWT');
				    }

				    public function getQuestions()
				    {
				        $likedQuestionsID = Favourite::where('user_id', auth()->id())->pluck('question_id');
				        $questions = Question::find($likedQuestionsID);

				        return QuestionResource::collection($questions);
				    }
				    
				    public function favouriteIt(Question $question)
				    {   //Adds Favourite
				        $question->favourites()->create([ 
				            'user_id' => auth()-> id(),
				        ]);

				        //Makes it live
				        broadcast(new FavouriteEvent($question->slug, 1))->toOthers();
				    }

				    public function unfavouriteIt(Question $question)
				    {   //Removes Favourite
				        $question->favourites()->where('user_id', auth()->id())->first()->delete();
				    
				        //Makes it live
				        broadcast(new FavouriteEvent($question->slug, 0))->toOthers();
				    }
				}

		#Broadcast favourite channel and edit construct
			#app->Events->FavouriteEvent
				<?php

				namespace App\Events;

				use Illuminate\Broadcasting\Channel;
				use Illuminate\Broadcasting\InteractsWithSockets;
				use Illuminate\Broadcasting\PresenceChannel;
				use Illuminate\Broadcasting\PrivateChannel;
				use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
				use Illuminate\Foundation\Events\Dispatchable;
				use Illuminate\Queue\SerializesModels;

				class FavouriteEvent implements ShouldBroadcast
				{
				    use Dispatchable, InteractsWithSockets, SerializesModels;
				    
				    public $slug;
				    public $type;

				    public function __construct($slug, $type)
				    {
				        $this->slug = $slug;
				        $this->type = $type;
				    }

				    public function broadcastOn()
				    {
				        return new Channel('favouriteChannel');
				    }
				}

		#Add the favouriteChannel
			#routes->channels.php
				<?php

				use Illuminate\Support\Facades\Broadcast;

				Broadcast::channel('App.User.{id}', function ($user, $id) {
				    return (int) $user->id === (int) $id;
				});

				Broadcast::channel('removeLikeChannel', function () {
				    return true;
				});

				Broadcast::channel('removeReplyChannel', function () {
				    return true;
				});

				Broadcast::channel('favouriteChannel', function () {
				    return true;
				});

		#Restart the server
			php artisan config:clear
			php artisan serve

		#Go to pusher website to check if connection is Successful
			#Open debug console of Pusher and refresh thelocal host page. The connection to the local host should be displayed.

			#Like any reply and check the debug console. It should display the data of the reply that has been liked

	[11.11] Favourite Frontend Operations
		#listen event in the created() of Favourite.vue using Laravel->Receving Broadcast->Listening the event
			#resources->js->components->extra->Favourite.vue
				<template>
				    <div class="flex flex-col">
				        <button @click="favouriteIt" :class="color" class="focus:outline-none">
				            <i class="fas fa-heart"></i> {{count}}
				        </button>
				    </div>
				</template>

				<script>
				    export default {
				        name: 'Favourite',

				        props: ['slug', 'count', 'favourited'],

				        computed: {
				            color() {
				                return this.favourited ? 'text-red-500' : 'text-gray-700'
				            }
				        },

				        created() {
				            Echo.channel('favouriteChannel')
				                .listen('FavouriteEvent', (e) => {
				                    if(this.slug == e.slug) {
				                        e.type == 1? this.count ++ : this.count --
				                    }
				                });
				        },

				        methods: {
				            favouriteIt() {
				                if(User.loggedIn()) {
				                    this.favourited ? this.removeFavourite() : this.addFavourite()
				                    this.favourited = !this.favourited
				                } else {
				                    EventBus.$emit('displayingError', (this.slug))
				                }
				            },

				            addFavourite() {
				                axios.post(`/api/questions/${this.slug}/favourite`)
				                    .then(res => this.count ++)
				                    .catch(errors => console.log(errors))
				            },

				            removeFavourite() {
				                axios.delete(`/api/questions/${this.slug}/favourite`)
				                    .then(res => this.count --)
				                    .catch(errors => console.log(errors))
				            }
				        }

				    }
				</script>

				<style>

				</style>




12) Pagination
	[12.1] Backend Operations
		#Replace get() with paginate() in index()
			#app->Http->Controllers->QuestionController
				<?php

				namespace App\Http\Controllers;

				use App\Question;
				use Illuminate\Http\Request;
				use Illuminate\Support\Str;
				use App\Http\Resources\QuestionResource;
				use App\Http\Requests\QuestionRequest;


				class QuestionController extends Controller
				{
				    public function __construct()
				    {
				        $this->middleware('JWT', ['except' => ['index', 'show']]);
				    }
				                
				    public function index()
				    {
				        return QuestionResource::collection(Question::latest()->paginate(5));
				    }

				    public function store(QuestionRequest $request)
				    {
				        $request['slug'] = Str::slug($request->title);

				        $question = auth()->user()->questions()->create($request->all()); 

				        /*$question = Question::create([
				            'title' => $request->title,
				            'slug' => Str::slug($request->title),
				            'body' => $request->body,
				            'category_id' => $request->category_id,
				            'user_id' => auth()->user()->id
				        ]);*/

				        return (new QuestionResource($question))->response()->setStatusCode(201);
				    }

				    public function show(Question $question)
				    {
				        return new QuestionResource($question);
				    }

				    public function update(QuestionRequest $request, Question $question)
				    {
				        $request['slug'] = Str::slug($request->title);

				        $question->update($request->all()); //To use request->all(), in the model, add proteced protected $fillable =[title,body...].

				        /*$question->update(
				            [
				                'title' => $request->title,
				                'slug' => Str::slug($request->title),
				                'body' => $request->body,
				                'category_id' => $request->category_id,
				            ]
				        );*/ //For this method, in model, only protected $guarded=[] is fine.

				        return (new QuestionResource($question))->response()->setStatusCode(202);
				    }

				    public function destroy(Question $question)
				    {
				        $question->delete();

						return response('deleted', 204);
				    }
				}

	[12.2] Frontend Operations
		#All operations in single component
			#resources->js->components->Dashboard
				<template>
				    <div>
				        <div class="flex justify-center">
				            <div class="w-4/6">
				                <div v-for="question in questions" :key="question.id">
				                    <QuestionCard :question="question"/>
				                </div>

				                <div class="flex justify-between m-3 my-5 rounded w-auto font-sans">
				                    <div>
				                        <a @click="getQuestions(pagination.first_page_url)" class="block text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500 border border-gray-400 px-3 py-2 rounded" href="#">First</a>
				                    </div>

				                    <div>
				                        <ul class="flex justify-center">
				                            <li @click="getQuestions(pagination.prev_page_url)"><a :class="prevDisable" class="block border border-gray-300 px-3 py-2 rounded" href="#"><i class="fas fa-backward"></i></a></li>
				                            <li><a class="cursor-not-allowed block text-blue-800 bg-white border border-gray-400 px-3 py-2 rounded" href="#">Page {{pagination.current_page}} of {{pagination.last_page}}</a></li>
				                            <li @click="getQuestions(pagination.next_page_url)"><a :class="nextDisable" class="block border border-gray-300 px-3 py-2 rounded" href="#"><i class="fas fa-forward"></i></a></li>
				                        </ul>
				                    </div>

				                        <div>
				                        <a @click="getQuestions(pagination.last_page_url)" class="block text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500 border border-gray-400 px-3 py-2 rounded" href="#">Last</a>
				                    </div>
				                </div>
				            </div>

				            <div class="w-2/6">
				                <div class="flex flex-wrap justify-center overflow-auto h-96">
				                    <div v-for="category in categories" :key="category.id">
				                        <CategoryBox :category="category"/>
				                    </div>
				                </div>
				            </div>  
				        </div>   
				    </div>
				    
				</template>

				<script>
				    import QuestionCard from './extras/QuestionCard'
				    import CategoryBox from './extras/CategoryBox'

				    export default {
				        name: 'Dashboard',

				        components: {QuestionCard, CategoryBox},

				        data() {
				            return {
				                questions: '',
				                categories: '',
				                pagination: {}
				            }
				        },

				        computed: {
				            prevDisable() {
				                return this.pagination.prev_page_url ? 'text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500' : 'cursor-not-allowed text-gray-500 bg-gray-100'
				            },

				            nextDisable() {
				                return this.pagination.next_page_url ? 'text-blue-800 bg-white hover:text-blue-500 hover:border-blue-500' : 'cursor-not-allowed text-gray-500 bg-gray-100'
				            }
				        },

				        created() {
				            this.getQuestions()
				            this.getCategories()
				        },

				        methods: {
				            getQuestions(page_url) {
				                page_url = page_url || 'api/questions'

				                axios.get(page_url)
				                    .then(res => {
				                        this.questions = res.data.data
				                        this.makePagination(res.data.meta, res.data.links)
				                    })
				                    .catch(errors => console.log(errors))
				            },

				            makePagination(meta, links) {
				                this.pagination = {
				                    current_page: meta.current_page,
				                    last_page: meta.last_page,
				                    
				                    next_page_url: links.next,
				                    prev_page_url: links.prev,
				                    first_page_url: links.first,
				                    last_page_url: links.last
				                }
				            },

				            getCategories() {
				                axios.get('api/categories')
				                    .then(res => this.categories = res.data.data)
				                    .catch(errors => console.log(errors))
				            }
				        }
				    }
				</script>

				<style>

				</style>



13) Bug Fixes
	[13.1] Logout user by default once the session is over
		#Add jwt middleware in NotificationController just like any other controllers
			#app->Http->Controllers->NotificationController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\NotificationResource;

				class NotificationController extends Controller
				{
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

				    public function markAsRead(Request $request)
				    {
				        auth()->user()->notifications->where('id', $request->id)->markAsRead();
				    }
				}

		#Create a new js file to handle exception in the Frontend
			#resources->js->helpers->exception.js
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
				import Vue from 'vue';
				import router from './router/router';
				import App from './components/App';

				import '@fortawesome/fontawesome-free/css/all.css'
				import '@fortawesome/fontawesome-free/js/all.js'

				import User from './helpers/user.js';
				window.User = User

				import Exception from './helpers/exception.js';
				window.Exception = Exception

				window.EventBus = new Vue();

				require('./bootstrap');

				window.Vue = require('vue');

				const app = new Vue({
				    el: '#app',
				    components: {
				        App
				    },
				    router
				});

		#User the isExpired function in the Notification.vue to catch error
			#resources->js->components->extras/Notifications.vue
				<template>
				    <div class="relative">
				        <button @click="isOpen = !isOpen" class="flex block focus:outline-none items-center">
				            <div :class="color">
				                <i class="fas fa-bell text-2xl mr-3"></i>
				            </div>

				            <p class="mr-5">{{unreadCount}}</p>
				        </button>
				        
				        <div v-if="isOpen" @click="isOpen = false" class="fixed bg-black opacity-25 right-0 left-0 top-0 bottom-0"></div>

				        <div v-if="isOpen" class="absolute right-0 mt-4 w-96 shadow-xl bg-white">
				            <div v-for="item in unread" :key="item.id" class="py-3 px-3 border-b border-gray-300 bg-blue-100 hover:bg-white border-b hover:border-blue-500">
				                <NotificationCard :item="item"/>
				            </div>

				            <div v-for="item in read" :key="item.id" class="py-3 px-3 border-b border-gray-300 hover:bg-blue-100 border-b hover:border-blue-500">
				                <NotificationCard :item="item"/>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import NotificationCard from './NotificationCard'

				    export default {
				        name: "Notifications",

				        components: {NotificationCard},

				        data() {
				            return {
				                isOpen: false,
				                read: {},
				                unread: {},
				                unreadCount: null
				            }
				        },

				        computed: {
				            color() {
				                return this.unreadCount > 0 ? 'text-blue-500' : 'text-gray-600';
				            }
				        },

				        created() {
				            this.listen()

				            if(User.loggedIn()) {
				                this.getUnread()
				            }
				        },

				        methods: {
				            getUnread() {
				                axios.post('/api/notifications')
				                    .then(res => {
				                        this.read = res.data.read
				                        this.unread = res.data.unread
				                        this.unreadCount = res.data.unread.length
				                    })
				                    .catch(error => Exception.handle(error))
				            },

				            listen() {
				                EventBus.$on('markingRead', (notification) => {
				                    this.isOpen = false

				                    if(this.read.includes(notification)) {
				                        //
				                    } else {
				                        axios.post('/api/markasread', {id: notification.id})
				                            .then(res => {
				                                this.unread.splice(notification, 1)
				                                this.read.push(notification)
				                                this.unreadCount --
				                            })
				                    } 
				                }),

				                Echo.private('App.User.' + User.id())
				                    .notification((notification) => {
				                        this.unread.unshift(notification)
				                        this.unreadCount ++
				                    });
				            },
				        }
				    }
				</script>

				<style>

				</style>

	[13.2] Remove errors when user starts typing
		#Add watch on input fields //Same can be done on login and register as well
			#resources->js->components->questions->CreateQuestion.vue
				<template>
				    <div class="w-full my-16 flex justify-center">
				        <form @submit.prevent="createQuestion" class="px-8 pt-6 pb-8 mb-4 w-3/6 bg-white shadow-2xl rounded justify-center absolute">
				            <h1 class="text-3xl py-3 text-blue-800">Ask Question!</h1>

				            <div class="flex pb-6">
				                <ImageCircle :name="user.name" :avatar="user.avatar"/>

				                <router-link v-if="user" :to="'/users/' + user.id" class="font-semibold text-md ml-2 text-blue-600">
				                    {{user.name}}

				                    <p class="text-gray-600 text-xs font-light">
				                        {{user.email}}
				                    </p>
				                </router-link>
				            </div>

				            <div class="reletive">
				                <label for="title" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Title</label>

				                <div class="col-md-6">
				                    <input v-model="questionForm.title" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Add the title">

				                    <span v-if="errorMode" class="text-red-700 pt-1 text-sm" role="alert">
				                        {{errors.title[0]}}
				                    </span>
				                </div>
				            </div>

				            <div class="pt-3">
				                <label for="body" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Write the message</label>

				                <div class="">
				                    <textarea v-model="questionForm.body" rows="3" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline" type="text" placeholder="Write the description">
				                    
				                    </textarea>
				                    <span v-if="errorMode" class="text-red-700 pt-1 text-sm" role="alert">
				                        {{errors.body[0]}}
				                    </span>
				                </div>
				            </div>

				            <div class="pt-3">
				                <label for="category_id" class="uppercase text-blue-800 text-xs font-bold absolute p-2">Category</label>

				                <div class="">
				                    <select v-model="questionForm.category_id" class="pt-8 w-full rounded bg-transparent shadow-2xl p-2 appearance-none text-gray-700 border focus:outline-none focus:shadow-outline">
				                        <option v-for="category in categories" :key="category.id" :value="category.id">{{category.name}}</option>
				                    </select>
				                    
				                    <span v-if="errorMode" class="text-red-700 pt-1 text-sm" role="alert">
				                        {{errors.category_id[0]}}
				                    </span>
				                </div>
				            </div>

				            <div class="">
				                <button type="submit" class="mt-8 uppercase rounded-lg shadow-2xl border text-sm bg-gray-100 text-gray-100 bg-blue-700 hover:border-blue-800 hover:bg-transparent hover:text-blue-800 font-semibold py-2 px-4 focus:outline-none">
				                    Post
				                </button>

				                <router-link to="/" class="mt-8 text-right uppercase rounded-lg text-blue-800 border text-sm hover:border-blue-800 font-semibold py-2 px-4 focus:outline-none">
				                    Cancel
				                </router-link>
				            </div>
				        </form>
				    </div>
				</template>

				<script>
				    import ImageCircle from '../extras/ImageCircle'

				    export default {
				        name: 'CreateQuestion',

				        components: {ImageCircle},

				        data() {
				            return {
				                questionForm: {
				                    title: null,
				                    body: null,
				                    category_id: null
				                },
				                categories: {},
				                user: {},
				                errors: {},
				                errorMode: false
				            }
				        },

				        created() {
				            if(!User.loggedIn()) {
				                this.$router.push('/')
				            }

				            axios.get('/api/categories')
				                .then(res => this.categories = res.data.data)
				                .catch(errors => console.log(errors))

				            axios.post('/api/auth/me')
				                    .then(res => {
				                        this.user = res.data
				                    })
				                    .catch(errors => console.log(errors))
				        },

				        methods: {
				            createQuestion() {
				                axios.post('/api/questions', this.questionForm)
				                    .then(res => this.$router.push('/'))
				                    .catch(error => {
				                        this.errorMode = true
				                        this.errors = error.response.data.errors
				                    })
				            }
				        },

				        watch: {
				            'questionForm.title'(newValue,oldValue) {
				                if(newValue != null) {
				                    this.errorMode = true
				                    this.errors.title[0] = null
				                }
				            },

				            'questionForm.body'(newValue,oldValue) {
				                if(newValue != null) {
				                    this.errorMode = true
				                    this.errors.body[0] = null
				                }
				            },
				            
				            'questionForm.category_id'(newValue,oldValue) {
				                if(newValue != null) {
				                    this.errorMode = true
				                    this.errors.category_id[0] = null
				                }
				            }
				        }
				    }
				</script>

				<style>

				</style>
























































































































































































































































































































































































































































































































		
















		





































				

























		














1) Create a project
	laravel new facebookPlus



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

			create database facebookPlus;

	[3.2] TablePlus -> Create a new connection -> MySQL -> User: root -> Connect
		#Open database bootcamp4

	[3.3] Edit .env file
		DB_DATABASE=bootcamp4

	[3.4] Exit mysql terminal and migrate to check if it works
		exit

		php artisan migrate

	[3.5] Refresh TablePlus to check if it works



4) Add Passport
	[4.1] Install Passport
		composer require laravel/passport

		php artisan migrate

		//php artisan (To check there is a new category of artisan passport command)

		php artisan passport:install

	[4.2] Add PassportClient in User Model
		#app->User.php
			<?php

			namespace App;

			use Illuminate\Contracts\Auth\MustVerifyEmail;
			use Illuminate\Foundation\Auth\User as Authenticatable;
			use Illuminate\Notifications\Notifiable;
			use Laravel\Passport\HasApiTokens;

			class User extends Authenticatable
			{
			    use Notifiable, HasApiTokens;


			    protected $fillable = [
			        'name', 'email', 'password',
			    ];

			    protected $hidden = [
			        'password', 'remember_token',
			    ];

			    protected $casts = [
			        'email_verified_at' => 'datetime',
			    ];
			}

	[4.3] Allow passport routes, config Auth guard and add middleware
		#app->Providers->AuthServiceProvider.php
			<?php

			namespace App\Providers;

			use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
			use Illuminate\Support\Facades\Gate;
			use Laravel\Passport\Passport;

			class AuthServiceProvider extends ServiceProvider
			{
			    protected $policies = [
			        // 'App\Model' => 'App\Policies\ModelPolicy',
			    ];

			    public function boot()
			    {
			        $this->registerPolicies();

			        Passport::routes();
			    }
			}
		
		#config->auth.php
			...

			'guards' => [
				...

			    'api' => [
			        'driver' => 'passport',
			        'provider' => 'users',
			        'hash' => false,
			    ],
			],

		#app->http->Kernel.php
			...

			protected $middlewareGroups = [
		        'web' => [
		            \App\Http\Middleware\EncryptCookies::class,
		            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
		            \Illuminate\Session\Middleware\StartSession::class,
		            // \Illuminate\Session\Middleware\AuthenticateSession::class,
		            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
		            \App\Http\Middleware\VerifyCsrfToken::class,
		            \Illuminate\Routing\Middleware\SubstituteBindings::class,
		            \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
		        ],

		        'api' => [
		            'throttle:60,1',
		            \Illuminate\Routing\Middleware\SubstituteBindings::class,
		        ],
		    ];

	[4.4] Add basic authentication routes in api
		#routes->api.php
			<?php

			use Illuminate\Http\Request;
			use Illuminate\Support\Facades\Route;


			//AUTH                                      
			Route::post('/login', 'AuthController@login');
			Route::post('/register', 'AuthController@register');
			Route::post('/me', 'AuthController@me');
			Route::post('/logout', 'AuthController@logout');
			//auth middleware in Constructor of AuthController is added. If not, I need to put me and logoute routes inside the Route::middleware('auth:api') group

			Route::middleware('auth:api')->group(function () {
			    Route::get('/user', function (Request $request) {
			        return $request->user();
			    });


			});

	[4.5] Create Controller and check on Postman
		php artisan make:controller AuthController

		#app->http->controllers->AuthController.php
			<?php

			namespace App\Http\Controllers;

			use Illuminate\Http\Request;
			use App\Http\Controllers\Controller;
			use Illuminate\Support\Facades\Auth;
			use App\Http\Resources\User as UserResource;

			use Carbon\Carbon;
			use Validator;
			use App\User;


			class AuthController extends Controller
			{
			    public function __construct()
			    {
			        $this->middleware('auth:api', ['except' => ['login', 'register']]);
			    }

			    public $successStatus = 200;

			    public function login()
			    {
			        $data = request()->validate([
			            'email' => 'required',
			            'password' => 'required'
			        ]);

			        if(Auth::attempt($data)) {
			            return $this->responseAfterLogin();
			        }

			        //Inner objects are created based on manual app->Exceptions->ValidationErrorException structure for best practice.
			        return response()->json(['errors' => ['meta' => ['unauthorised' => 'Incorrect Email or Password!']]], 401);
			    }

			    public function register(Request $request)
			    {
			        $data = request()->validate([
			            'name' => 'required',
			            'email' => 'required|email',
			            'password' => 'required',
			            'confirm_password' => 'required|same:password',
			        ]);

			        $data['password'] = bcrypt($data['password']);

			        User::create($data);

			        return $this->login();
			    }

			    public function responseAfterLogin() {
			        $user = auth()->user();

			        $token =  $user->createToken('MyApp')->accessToken;

			        return response()->json([
			            'access_token' => $token,
			            'name' => auth()->user()->name
			        ]);
			    }

			    public function me()
			    {
			        $user = auth()->user();

			        return response()->json(new UserResource($user), $this->successStatus);
			    }

			    public function logout(Request $request)
			    {
			        $user = auth()->user()->token()->revoke();

			        return response()->json('Successfully logged out', $this->successStatus);
			    }
			}

		#Use Postman to check
			#login
				Post: http://127.0.0.1:8000/api/login
					Body:
						email: user@test.com (From MySQL TablePlus)
						password: password (From UserFactory)
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details -> Copy the token

			#me
				Post: http://127.0.0.1:8000/api/me
					Authorization:
						Bearer Token: Paste the copied token 
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: User details

			#logout
				Post: http://127.0.0.1:8000/api/logout (Details same as me)
					Authorization:
						Bearer Token: Paste the copied token 
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Successfully logged out

				#Check me again:
					#Output: Unauthenticated

			#signup
				Post: http://127.0.0.1:8000/api/register
					Body:
						name: test
						email: test@test.com
						password: password
						confirm_password: password
					Header:
						Accept: application/json
						Content-type: application/json

				#Output: Token details + User name -> Copy the token



3) Complete backend CRUD
	[3.1] Create Migration, ResourceController and Factory in one command
		php artisan make:model Post -mfr
		php artisan make:model Comment -mfr
		php artisan make:model Friend -mfr
		php artisan make:model Like -mfr
		php artisan make:model Avatar -mfr
		php artisan make:model Picture -mfr
		php artisan make:model Item -mfr
		php artisan make:model Category -mfr
		php artisan make:model Bookmark -mfr
		php artisan make:model Image -mfr
		php artisan make:model Favourite -mfr


	[3.2] Add values in Migration
		#user
			Schema::create('users', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->string('email')->unique();
	            $table->string('city')->nullable();
	            $table->string('gender')->nullable();
	            $table->timestamp('birthday'); //It's not smart to make it nullable because we are filtering birthdays. Null birthday will throw an error.
	            $table->string('interest')->nullable();
	            $table->text('about')->nullable();
	            $table->timestamp('email_verified_at')->nullable();
	            $table->string('provider_id')->nullable(); //It will be null for the user who will try to login using register form.
	            $table->string('provider_name')->nullable(); //It will be null for the user who will try to login using register form.
	            $table->string('password');
	            $table->rememberToken();
	            $table->timestamps();
	        });

		#posts
	        Schema::create('posts', function (Blueprint $table) {
	            $table->id();
	            $table->string('body');
	            $table->unsignedBigInteger('repost_id')->nullable();
	            $table->unsignedBigInteger('friend_id')->nullable();
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #comments
	    	Schema::create('comments', function (Blueprint $table) {
	            $table->id();
	            $table->text('body')->nullable();
	            $table->string('gif')->nullable();
	            $table->unsignedBigInteger('post_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #friends
	    	Schema::create('friends', function (Blueprint $table) {
	            $table->id();
	            $table->unsignedBigInteger('friend_id');
	            $table->unsignedBigInteger('user_id');
	            $table->tinyInteger('status')->nullable();
	            $table->timestamp('confirmed_at')->nullable();
	            $table->timestamps();

	            $table->unique(['user_id', 'friend_id']);
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #likes
	    	Schema::create('likes', function (Blueprint $table) {
	            $table->id();
	            $table->unsignedBigInteger('post_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #avatars
	    	Schema::create('avatars', function (Blueprint $table) {
	            $table->id();
	            $table->string('path');
	            $table->string('width');
	            $table->string('height');
	            $table->string('type');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #pictures
	    	Schema::create('pictures', function (Blueprint $table) {
	            $table->id();
	            $table->string('path');
	            $table->unsignedBigInteger('post_id');
	            $table->timestamps();

	            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
	        });

	    #items
	    	Schema::create('items', function (Blueprint $table) {
	            $table->id();
	            $table->string('title');
	            $table->string('description');
	            $table->integer('price');
	            $table->unsignedBigInteger('category_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            //$table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade'); Because we created Item first and category later on.
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #categories
	    	Schema::create('categories', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->timestamps();
	        });

	    #bookmarks
	    	Schema::create('bookmarks', function (Blueprint $table) {
	            $table->id();
	            $table->unsignedBigInteger('item_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #images
	    	Schema::create('images', function (Blueprint $table) {
	            $table->id();
	            $table->string('path');
	            $table->unsignedBigInteger('item_id');
	            $table->timestamps();

	            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
	        });

	    #favourites
	    	Schema::create('favourites', function (Blueprint $table) {
	            $table->id();
	            $table->integer('type')->nullable();
	            $table->unsignedBigInteger('comment_id');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('comment_id')->references('id')->on('comments')->onDelete('cascade');
	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #notifications
	    	Schema::create('notifications', function (Blueprint $table) {
	            $table->uuid('id')->primary();
	            $table->string('type');
	            $table->morphs('notifiable');
	            $table->longText('data');
	            $table->timestamp('read_at')->nullable();
	            $table->timestamps();
	        });


	[3.3] Add relationship in Models
		#User
			<?php

			namespace App;

			use Illuminate\Contracts\Auth\MustVerifyEmail;
			use Illuminate\Foundation\Auth\User as Authenticatable;
			use Illuminate\Notifications\Notifiable;
			use Laravel\Passport\HasApiTokens;
			use Laravel\Scout\Searchable;

			use App\Post;
			use App\Comment;
			use App\Friend;
			use App\Avatar;
			use App\Item;
			use Carbon\Carbon;

			class User extends Authenticatable
			{
			    use Notifiable, HasApiTokens;

			    protected $fillable = [
			        'name', 'email', 'city', 'gender', 'birthday', 'interest', 'about', 'provider_id', 'provider_name', 'password',
			    ];

			    protected $dates = ['birthday'];

			    protected $hidden = [
			        'password', 'remember_token',
			    ];

			    protected $casts = [
			        'email_verified_at' => 'datetime',
			    ];

			    public function getPathAttribute()
			    {
			        return "/users/$this->id";
			    }

			    public function posts()
			    {
			        return $this->hasMany(Post::class);
			    }

			    public function comments()
			    {
			        return $this->hasMany(Comment::class);
			    }

			    public function friends()
			    {
			        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id');
			    }

			    public function likes()
			    {
			        return $this->belongsToMany(Post::class, 'likes', 'user_id', 'post_id');
			    }

			    public function images()
			    {
			        return $this->hasMany(Avatar::class);
			    }

			    public function items()
			    {
			        return $this->hasMany(Item::class);
			    }

			    public function bookmarks()
			    {
			        return $this->belongsToMany(Item::class, 'bookmarks', 'user_id', 'item_id');
			    }

			    public function coverImage()
			    {
			        return $this->hasOne(Avatar::class)
			            ->orderByDesc('id')
			            ->where('type', 'cover')
			            ->withDefault(function ($image) {
			                $image->path = 'uploadedAvatars/cover.jpg';
			                $image->width = 1500;
			                $image->height = 500;
			                $image->type = 'cover';
			            });
			    }

			    public function profileImage()
			    {
			        return $this->hasOne(Avatar::class)
			            ->orderByDesc('id')
			            ->where('type', 'profile')
			            ->withDefault(function ($image) {
			                $image->path = 'uploadedAvatars/profile.jpg';
			                $image->width = 750;
			                $image->height = 750;
			                $image->type = 'profile';
			            });
			    }

			    //While post or put request, the birthday would be a string of '27/05/2000'. It needs to be converted into Carbon date before saving into the database. That's why this inbuilt function is used.
			    public function setBirthdayAttribute($birthday)
			    {
			        $this->attributes['birthday'] = Carbon::parse($birthday);
			    }
			}

		#Post
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\User;
			use App\Comment;


			class Post extends Model
			{
			    protected $fillable = ['body', 'repost_id', 'friend_id', 'user_id'];

			    public function getPathAttribute()
			    {
			        return "/posts/$this->id";
			    }

			    public function comments()
			    {
			        return $this->hasMany(Comment::class)->latest('updated_at');
			    }

			    public function user()
			    {
			        return $this->belongsTo(User::class);
			    }

			    public function likes()
			    {
			        return $this->belongsToMany(User::class, 'likes', 'post_id', 'user_id');
			    }

			    public function pictures()
			    {
			        return $this->hasMany(Picture::class);
			    }
			}

		#Comment
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\Post;
			use App\User;
			use App\Favourite;


			class Comment extends Model
			{
			    protected $guarded = [];

			    public function post()
			    {
			        return $this->belongsTo(Post::class);
			    }

			    public function user()
			    {
			        return $this->belongsTo(User::class);
			    }

			    public function favourites()
			    {
			        return $this->hasMany(Favourite::class);
			    }
			}

		#Friend
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Friend extends Model
			{
			    protected $guarded = [];

			    //To convert default String into a Carbon instance
			    protected $dates =['confirmed_at'];

			    public static function friendship($userId)
			    {
			        return (new static())
			            ->where(function ($query) use ($userId) { return $query
			                ->where('user_id', auth()->user()->id)
			                ->where('friend_id', $userId);
			            })  ->orWhere(function ($query) use ($userId) { return $query
			                ->where('friend_id', auth()->user()->id)
			                ->where('user_id', $userId);
			            })->first();
			    }

			    public static function retrieveFriendships()
			    {
			        return (new static())
			            ->whereNotNull('confirmed_at')
			            ->where(function ($query) {
			                return $query->where('user_id', auth()->user()->id)
			                    ->orWhere('friend_id', auth()->user()->id);
			            })->get();
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

		#Avatar
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Avatar extends Model
			{
			    protected $guarded = [];
			}

		#Picture
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Picture extends Model
			{
			    protected $guarded = [];
			}

		#Item
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\User;
			use App\Category;
			use App\Image;


			class Item extends Model
			{
			    protected $fillable = ['title', 'description', 'price', 'category_id'];

			    public function user()
			    {
			        return $this->belongsTo(User::class);
			    }

			    public function category()
			    {
			        return $this->belongsTo(Category::class);
			    }

			    public function bookmarks()
			    {
			        return $this->belongsToMany(User::class, 'bookmarks', 'item_id', 'user_id');
			    }

			    public function images()
			    {
			        return $this->hasMany(Image::class);
			    }
			}

		#Category
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\Item;


			class Category extends Model
			{
			    protected $guarded = [];

			    public function items()
			    {
			        return $this->hasMany(Item::class);
			    }
			}

		#Bookmark
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Bookmark extends Model
			{
			    protected $guarded = [];
			}

		#Image
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Image extends Model
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
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use App\User;
			use Faker\Generator as Faker;
			use Illuminate\Support\Str;


			$factory->define(User::class, function (Faker $faker) {
			    $gender = $faker->randomElement(['male', 'female']);

			    return [
			        'name' => $faker->name($gender),
			        'email' => $faker->unique()->safeEmail,
			        'city' => $faker->city,
			        'gender' => $gender,
			        'birthday' => $faker->dateTimeBetween('1990-01-01', '2012-12-31')->format('d-m-Y'),
			        'interest' => $faker->randomElement(['male', 'female', 'both']),
			        'about' => $faker->text,
			        'email_verified_at' => now(),
			        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
			        'remember_token' => Str::random(10),
			    ];
			});

		#PostFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Post;
			use App\User;

			$factory->define(Post::class, function (Faker $faker) {
			    return [
			        'body' => $faker->text,
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#CommentFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Comment;
			use App\Post;
			use App\User;


			$factory->define(Comment::class, function (Faker $faker) {
			    return [
			        'body' => $faker->text,
			        'gif' => null,
			        'post_id' => function() {
			            return Post::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});


		#LikeFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Like;
			use App\User;
			use App\Post;

			/*
				In blogSPA we didn't add post_id and used $post as RMB because we used hasMany relationship.
				It won't work here because we are using many-to-many relationship in this project.
			*/
			$factory->define(Like::class, function (Faker $faker) {
			    return [
			        'post_id' => function() {
			            return Post::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#ItemFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Item;
			use App\User;
			use App\Category;


			$factory->define(Item::class, function (Faker $faker) {
			    return [
			        'title' => $faker->sentence,
			        'description' => $faker->text,
			        'price' => $faker->numberBetween(1, 500),
			        'category_id' => function() {
			            return Category::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#CategoryFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Category;


			$factory->define(Category::class, function (Faker $faker) {
			    return [
			        'name' => $faker->word,
			    ];
			});

		#BookmarkFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Bookmark;
			use App\Item;
			use App\User;


			$factory->define(Bookmark::class, function (Faker $faker) {
			    return [
			        'item_id' => function() {
			            return Item::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});

		#FavouriteFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use Faker\Generator as Faker;

			use App\Favourite;
			use App\Comment;
			use App\User;

			$factory->define(Favourite::class, function (Faker $faker) {
			    return [
			        'type' => $faker->randomElement([1, 2, 3]),
			        'Comment_id' => function() {
			            return Comment::all()->random();
			        },
			        'user_id' => function() {
			            return User::all()->random();
			        }
			    ];
			});


	[3.5] Modify DatabaseSeeder
		<?php

		use Illuminate\Database\Seeder;

		use App\User;
		use App\Post;
		use App\Comment;
		use App\Favourite;
		use App\Like;
		use App\Item;
		use App\Category;
		use App\Bookmark;

		class DatabaseSeeder extends Seeder
		{
		    public function run()
		    {
		        factory(User::class, 5)->create();
		        factory(Post::class, 10)->create();
		        factory(Like::class, 5)->create();
		        factory(Comment::class, 10)->create();
		        factory(Favourite::class, 5)->create();
		        factory(Category::class, 5)->create();
		        factory(Item::class, 10)->create();
		        factory(Bookmark::class, 5)->create();
		    }
		}


	[3.6] Make api routes
		#routes->api.php
			<?php

			use Illuminate\Http\Request;
			use Illuminate\Support\Facades\Route;

			//Every route in this file MUST have an api prefix.

			//AUTH
			Route::post('/login', 'AuthController@login');
			Route::post('/register', 'AuthController@register');
			Route::post('/me', 'AuthController@me');
			Route::post('/logout', 'AuthController@logout');
			//auth middleware in Constructor of AuthController is added. If not, I need to put me and logout routes inside the Route::middleware('auth:api') group

			//SOCIALITE
			Route::get('/login/{provider}', 'AuthController@redirectToProvider');
			Route::get('/login/{provider}/callback', 'AuthController@handleProviderCallback');

			Route::middleware('auth:api')->group(function () {
			    //CRUD
			    Route::apiResource('/posts', 'PostController');
			    Route::apiResource('/users', 'UserController');
			    Route::apiResource('/posts/{post}/comments', 'CommentController');
			    Route::apiResource('/items', 'ItemController');
			    Route::apiResource('/categories', 'CategoryController');

			    //FRIEND REQUEST
			    Route::post('/send-request', 'FriendController@sendRequest');
			    Route::post('/confirm-request', 'FriendController@confirmRequest');
			    Route::post('/delete-request', 'FriendController@deleteRequest');

			    //LIKE, FAVOURITE, BOOKMARK
			    Route::post('/posts/{post}/like-dislike', 'LikeController@likeDislike');
			    Route::post('/posts/{post}/comments/{comment}/favourite-unfavourite', 'FavouriteController@favouriteUnfavourite');
			    Route::post('/items/{item}/bookmark-unbookmark', 'BookmarkController@bookmarkUnbookmark');

			    //IMAGE
			    Route::post('/upload-avatars', 'AvatarController@uploadAvatar');
			    Route::post('/upload-pictures', 'PictureController@uploadPicture');
			    Route::post('/upload-images', 'ImageController@uploadImage');
			    Route::post('/upload-gif', 'GifController@uploadGif');

			    //SHARE
			    Route::post('/share-post', 'ShareController@sharePost');

			    //FEATURES
			    Route::post('/filter-birthdays', 'FeatureController@filterBirthdays');
			    Route::post('/wish-birthday', 'FeatureController@wishBirthday');
			    Route::post('/notify-tagged-user', 'FeatureController@notifyTaggedUser');
			    Route::post('/get-all-avatars', 'FeatureController@getAllAvatars');


			    //NOTIFICATIONS
			    Route::post('/notifications', 'NotificationController@index');
			    Route::post('/mark-as-read', 'NotificationController@markAsRead');
			    Route::post('/hide-friend-buttons', 'NotificationController@hideFriendButtons');

			    //SEARCH
			    Route::post('/search', 'SearchController@getUsers');
			});



	[3.7] Make Requests
		#UserRequest
			php artisan make:request UserRequest

			#app->Http->Requests->UserRequest.php


		#PostRequest
			php artisan make:request PostRequest

			#app->Http->Requests->PostRequest.php
				<?php

				namespace App\Http\Requests;

				use Illuminate\Foundation\Http\FormRequest;

				class PostRequest extends FormRequest
				{
				    public function authorize()
				    {
				        return true;
				    }

				    public function rules()
				    {
				        return [
				            'body' => 'required'
				        ];
				    }
				}

		#CommentRequest
			php artisan make:request CommentRequest

			#app->Http->Requests->CommentRequest.php
				<?php

				namespace App\Http\Requests;

				use Illuminate\Foundation\Http\FormRequest;

				class CommentRequest extends FormRequest
				{
				    public function authorize()
				    {
				        return true;
				    }

				    public function rules()
				    {
				        return [
				            'body' => 'required'
				        ];
				    }
				}


	[3.8] Make Resources and Collections
		#User
			php artisan make:resource User

			#app->http->resources->User.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\Friend as FriendResource;
				use App\Http\Resources\Avatar as AvatarResource;

				use App\Friend;
				use Carbon\Carbon;


				class User extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'name' => $this->name,
				            'email' => $this->email,
				            'city' => $this->city,
				            'gender' => $this->gender,
				            'birthday' => [
				                'when' => $this->birthday->format('d') - Carbon::now()->format('d'),
				                'age' => Carbon::now()->format('Y') - $this->birthday->format('Y'), //'y' displays 20 and 'Y' displays 2020
				                'day_name' => $this->birthday->format('l'),
				                'day' => $this->birthday->day,
				                'month' => $this->birthday->month,
				                'year' => $this->birthday->year,
				            ],
				            'interest' => $this->interest,
				            'about' => $this->about,

				            'friendship' => new FriendResource(Friend::friendship($this->id)),

				            'cover_image' => new AvatarResource($this->coverImage),

				            'profile_image' => new AvatarResource($this->profileImage),

				            'path' => $this->path
				        ];
				    }
				}

		#Post
			php artisan make:resource Post

			#app->http->resources->Post.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\User as UserResource;
				use App\Http\Resources\Picture as PictureResource;
				use App\Http\Resources\Post as PostResource;

				use App\User;


				class Post extends JsonResource
				{
				    public function toArray($request)
				    {
				        $shared_post_id = \App\Post::find($this->repost_id);
				        $shared_post_count =  \App\Post::where('repost_id', $this->id)->count();
				        $friend =  User::find($this->friend_id);

				        return [
				            'id' => $this->id,
				            'body' => $this->body,
				            'user_id' => $this->user_id,
				            'created_at' => $this->created_at->diffForHumans(),

				            'comments' => new CommentCollection($this->comments),

				            'likes' => new LikeCollection($this->likes),

				            'pictures' => new PictureCollection($this->pictures),

				            //PostResource inside PostResource
				            'shared_post' => new PostResource($shared_post_id),
				            'shared_count' => $shared_post_count,

				            //Friend_id to check on which friend's profile auth user posted
				            'posted_on' => new UserResource($friend),

				            'posted_by' => new UserResource($this->user),

				            'path' => $this->path,
				        ];
				    }
				}

		#PostCollection
			php artisan make:resource PostCollection

			#app->http->resources->PostCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;


				class PictureCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'picture_count' => $this->count(),
				            'links' => [
				                'self' => '/posts',
				            ],
				        ];
				    }
				}

		#Comment
			php artisan make:resource Comment

			#app->http->resources->Comment.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\User as UserResource;

				use App\User;


				class Comment extends JsonResource
				{
				    public function toArray($request)
				    {
				        //Operation For Tag
				        $users = User::all();

				        $newBody = null;
				        $taggedUserID = null;
				        $taggedUserName = null;

				        foreach ($users as $user) {
				            if (strpos($this->body, $user->name)) {
				                $replace = str_replace($user->name, '{ReplaceMe}', $this->body);
				                $newBody = explode("{ReplaceMe}", $replace);
				                $taggedUserID = $user->id;
				                $taggedUserName = $user->name;
				                break;
				            }
				        }

				        return [
				            'id' => $this->id,
				            'body' => $this->body,
				            'gif' => $this->gif,
				            'post_id' => $this->post_id,
				            'updated_at' => $this->updated_at->diffForHumans(),

				            'favourites' => new FavouriteCollection($this->favourites),
				            'user_favourited' => !! $this->favourites->where('user_id', auth()->id())->count(),
				            'favourited_type' => $this->favourites->where('user_id', auth()->id())->pluck('type'),

				            'tag' => [
				                'newBody' => $newBody,
				                'taggedUserID'=> $taggedUserID,
				                'taggedUserName'=> $taggedUserName,
				            ],

				            'commented_by' => new UserResource($this->user),

				            'path' => '/posts/' . $this->post_id . '/comments/' . $this->id,
				        ];
				    }
				}


		#CommentCollection
			php artisan make:resource CommentCollection

			#app->http->resources->CommentCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;

				class CommentCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'comment_count' => $this->count(),
				            'links' => [
				                'self' => '/posts',
				            ],
				        ];
				    }
				}

		#Friend
			php artisan make:resource Friend

			#app->http->resources->Friend.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\User as UserResource;


				class Friend extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'status' => $this->status,
				            'confirmed_at' => optional($this->confirmed_at)->diffForHumans(), //optional is used for the fields which are nullable
				            'user_id' => $this->user_id,
				            'friend_id' => $this->friend_id,
				            'path' => '/users/'.$this->friend_id
				        ];
				    }
				}

		#Like
			php artisan make:resource Like

			#app->http->resources->Like.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;

				class Like extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'user_id' => $this->pivot->user_id,
				            'post_id' => $this->pivot->post_id,
				            'created_at' => $this->created_at->now()->diffForHumans(),
				            'path' => '/posts/' . $this->pivot->post_id
				        ];
				    }
				}

		#LikeCollection
			php artisan make:resource LikeCollection

			#app->http->resources->LikeCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;

				class LikeCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'like_count' => $this->count(),
				            //No need to write 'user_id', contains('id') checks the available id there is.
				            'user_liked' => $this->collection->contains('id', auth()->user()->id),
				            'links' => [
				                'self' => '/posts',
				            ],
				        ];
				    }
				}

		#Avatar
			php artisan make:resource Avatar

			#app->http->resources->Avatar.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;

				class Avatar extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'path' => $this->path,
				            'width' => $this->width,
				            'height' => $this->height,
				            'type' => $this->type,
				        ];
				    }
				}

		#Picture
			php artisan make:resource Picture

			#app->http->resources->Picture.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;


				class Picture extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'path' => $this->path,
				        ];
				    }
				}

		#PictureCollection
			php artisan make:resource PictureCollection

			#app->http->resources->PictureCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;


				class PictureCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'picture_count' => $this->count(),
				            'links' => [
				                'self' => '/posts',
				            ],
				        ];
				    }
				}

		#Item
			php artisan make:resource Item

			#app->http->resources->Item.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\User as UserResource;
				use App\Http\Resources\Category as CategoryResource;


				class Item extends JsonResource
				{

				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'title' => $this->title,
				            'description' => $this->description,
				            'price' => $this->price,
				            'category_id' => $this->category_id,
				            'user_id' => $this->user_id,
				            'created_at' => $this->created_at->diffForHumans(),

				            //'replies' => new CommentCollection($this->comments),

				            'bookmarks' => new BookmarkCollection($this->bookmarks),

				            'images' => new ImageCollection($this->images),

				            'category' =>new CategoryResource($this->category),

				            'posted_by' => new UserResource($this->user),

				            'path' => '/items'
				        ];
				    }
				}


		#ItemCollection
			php artisan make:resource ItemCollection

			#app->http->resources->ItemCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;

				class ItemCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'item_count' => $this->count(),
				            'links' => [
				                'self' => '/posts',
				            ],
				        ];
				    }
				}

		#Category
			php artisan make:resource Category

			#app->http->resources->Category.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;

				class Category extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'name' => $this->name,
				            'created_at' => $this->created_at->diffForHumans()
				        ];
				    }
				}

		#Bookmark
			php artisan make:resource Bookmark

			#app->http->resources->Bookmark.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;

				class Bookmark extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'user_id' => $this->pivot->user_id,
				            'item_id' => $this->pivot->item_id,
				            'created_at' => $this->created_at->now()->diffForHumans(),
				            'path' => '/items/' . $this->pivot->item_id,
				        ];
				    }
				}

		#BookmarkCollection
			php artisan make:resource BookmarkCollection

			#app->http->resources->BookmarkCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;

				class BookmarkCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'bookmark_count' => $this->count(),
				            'user_bookmarked' => $this->collection->contains('id', auth()->user()->id),
				            'links' => [
				                'self' => '/items',
				            ],
				        ];
				    }
				}

		#Image
			php artisan make:resource Image

			#app->http->resources->Image.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;

				class Image extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'path' => $this->path,
				        ];
				    }
				}

		#ImageCollection
			php artisan make:resource ImageCollection

			#app->http->resources->ImageCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;

				class ImageCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'image_count' => $this->count(),
				            'links' => [
				                'self' => '/images',
				            ],
				        ];
				    }
				}

		#Favourite
			php artisan make:resource Favourite

			#app->http->resources->Favourite.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;

				class Favourite extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'type' => $this->type,
				            'user_id' => $this->user_id,
				            'comment_id' => $this->comment_id,
				            'created_at' => $this->created_at->now()->diffForHumans(),
				        ];
				    }
				}


		#FavouriteCollection
			php artisan make:resource FavouriteCollection

			#app->http->resources->FavouriteCollection.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\ResourceCollection;

				class FavouriteCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
				            'favourite_count' => $this->count(),
				            /*
				                unlike LikeCollection and BookmarkCollection, here 'id' refers to id of the entry in DB rather than user_id.
				                It is because we are using HasMany rather than ManyToMany. Thus, We have to use user_favourited in the CommentResource
				            */
				            //'user_favourited' => $this->collection->contains('id', auth()->user()->id),
				            'links' => [
				                'self' => '/posts',
				            ],
				        ];
				    }
				}

		#Notification
			php artisan make:resource Notification


			#app->http->resources->Notification.php
				<?php

				namespace App\Http\Resources;

				use App\Http\Resources\User as UserResource;
				use Illuminate\Http\Resources\Json\JsonResource;

				class Notification extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'user' => $this->data['user'],
				            'content' => $this->data['content'], //Post, comment, like whatever there is.
				            'message' => $this->data['message'],
				            'type' => substr($this->type, 18),
				            'created_at' => $this->created_at->diffForHumans()
				        ];
				    }
				}


	[3.9] Modify Controllers
		#AuthController
			#app->Http->Controllers->AuthController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Controllers\Controller;
				use Illuminate\Support\Facades\Auth;
				use App\Http\Resources\User as UserResource;
				use App\Notifications\LoginNotification;

				use Carbon\Carbon;
				use Laravel\Socialite\Facades\Socialite;
				use Validator;
				use App\User;

				class AuthController extends Controller
				{

				    public $user;

				    public function __construct()
				    {
				        $this->middleware('auth:api', ['except' => ['login', 'register', 'redirectToProvider', 'handleProviderCallback']]);
				    }

				    public $successStatus = 200;

				    public function login()
				    {
				        $data = request()->validate([
				            'email' => 'required',
				            'password' => 'required',
				        ]);

				        if(Auth::attempt($data)) {
				            return $this->responseAfterLogin();
				        }

				        //Inner objects are created based on manual app->Exceptions->ValidationErrorException structure for best practice.
				        return response()->json(['errors' => ['meta' => ['unauthorised' => 'Incorrect Email or Password!']]], 401);
				    }

				    public function register(Request $request)
				    {
				        $data = request()->validate([
				            'name' => 'required',
				            'email' => 'required|email',
				            'city' => 'required',
				            'gender' => 'required',
				            'birthday' => 'required',
				            'interest' => 'required',
				            'about' => 'required',
				            'provider_id' => '',
				            'password' => 'required',
				            'confirm_password' => 'required|same:password',
				        ]);

				        $data['password'] = bcrypt($data['password']);

				        User::create($data);

				        return $this->login();
				    }

				    public function responseAfterLogin() {
				        $user = auth()->user();

				        $token =  $user->createToken('MyApp')->accessToken;

				        //Send Mail notification
				        $user->notify(new LoginNotification($user));

				        return response()->json([
				            'access_token' => $token,
				            'name' => auth()->user()->name
				        ]);
				    }

				    public function me()
				    {
				        $user = auth()->user();

				        return response()->json(new UserResource($user), $this->successStatus);
				    }

				    public function logout(Request $request)
				    {
				        $user = auth()->user()->token()->revoke();

				        return response()->json('Successfully logged out', $this->successStatus);
				    }

				    public function redirectToProvider($provider)
				    {
				        return Socialite::driver($provider)->stateless()->redirect(); //We have to use stateless() because we are not using Laravel's default auth system
				    }

				    public function handleProviderCallback($provider)
				    {
				        $user = Socialite::driver($provider)->stateless()->user();

				        if (User::where('email', $user->email)->first()) {
				            //If user already exists
				            return view('passSocialiteDetails', ['email' => $user->email]);
				        } else {
				            //Else register User
				            $user = User::create([
				                'name' => ($user->nickname ?? $user->name),
				                'email' => $user->email,
				                'birthday' => '1996/1/1',
				                'provider_id' => $user->id,
				                'provider_name' => $provider,
				                'password' => bcrypt('password')
				            ]);

				            return view('passSocialiteDetails', ['email' => $user->email]);
				        }
				    }
				}

		#UserController
			php artisan make:controller UserController -r

			#app->Http->Controllers->UserController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\PostCollection;
				use App\Post;
				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;

				use App\User;


				class UserController extends Controller
				{
				    public function index()
				    {
				        $users = User::all();

				        return UserResource::collection($users);
				    }

				    public function store(Request $request)
				    {
				        //
				    }

				    public function show(User $user)
				    {
				        return [new UserResource($user), new PostCollection(Post::where('user_id', $user->id)->orWhere('friend_id', $user->id)->latest()->get())];
				    }

				    public function update(Request $request, User $user)
				    {
				        $user->update($request->all());

				        return (new UserResource($user))->response()->setStatusCode(201);
				    }

				    public function destroy($id)
				    {
				        //
				    }
				}

		#PostController
			php artisan make:controller PostController -r

			#app->Http->Controllers->PostController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\Post as PostResource;
				use App\Http\Resources\PostCollection;
				use App\Http\Requests\PostRequest;

				use Auth;
				use App\Post;
				use App\Friend;


				class PostController extends Controller
				{
				    public function index()
				    {
				        $friends = Friend::retrieveFriendships();

				        if ($friends->isEmpty()) {
				            return new PostCollection(Auth::user()->posts()->latest()->get());
				        }

				        return new PostCollection(Post::whereIn('user_id', [$friends->pluck('user_id'), $friends->pluck('friend_id')])->latest()->get());


				        /*  //Without PostCollection
				            return PostResource::collection(Auth::user()->posts()->latest()->get());
				        */
				    }

				    public function store(PostRequest $request)
				    {
				        /*  Different ways!

				            $request['slug'] = Str::slug($request->title);

				            $data = request()->validate([
				                'body' => 'required'
				            ]);
				                #OR

				            store(PostRequest $request)// Set new request rules

				            $post = Auth::user()->posts()->create($request->all());
				                #OR
				            $post = Auth::user()->posts()->create($data);
				                #OR
				            $post = Post::create([
				                'body' => $request->body,
				                'user_id' => Auth::user()->id
				            ]);
				        */

				        $post = request()->user()->posts()->create($request->all());

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }

				    public function show(Post $post)
				    {
				        return new PostResource($post);
				    }

				    public function update(PostRequest $request, Post $post)
				    {
				        $post->update($request->all());

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }

				    public function destroy(Post $post)
				    {
				        $post->delete();

				        return response('Deleted', 204);
				    }
				}

		#CommentController
			php artisan make:controller CommentController -r

			#app->Http->Controllers->CommentController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\CommentCollection;
				use App\Http\Resources\Post as PostResource;
				use App\Http\Requests\CommentRequest;
				use App\Notifications\CommentNotification;

				use App\Comment;
				use App\Post;


				class CommentController extends Controller
				{
				    public function index(Post $post)
				    {
				        return new PostResource($post);
				    }

				    public function store(CommentRequest $request, Post $post)
				    {
				        /*
				            public function store(Post $post)
				            {
				                $data = request()->validate([
				                    'body' => 'required',
				                ]);

				                $post->comments()->create(array_merge($data, ['user_id' => auth()->user()->id]));

				                return new CommentCollection($post->comments);
				            }
				        */
				        $request['user_id'] = auth()->user()->id;

				        $comment = $post->comments()->create($request->all());

				        //Send Notifications
				        $user = $post->user;

				        if($comment->user_id != $post->user_id) {
				            $user->notify(new CommentNotification($comment));
				        }

				        return new CommentCollection($post->comments);
				    }

				    public function show(Comment $comment)
				    {
				        //
				    }

				    public function update(CommentRequest $request, Post $post, Comment $comment)
				    {
				        $comment->update($request->all());

				        return new CommentCollection($post->comments);
				    }

				    public function destroy(Post $post, Comment $comment)
				    {
				        $comment->delete();

				        return response('Deleted', 204);
				    }
				}

		#FriendController
			php artisan make:controller FriendController -r

			#app->Http->Controllers->FriendController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Database\Eloquent\ModelNotFoundException;
				use App\Exceptions\UserNotFoundException;
				use App\Exceptions\RequestNotFoundException;
				use App\Exceptions\ValidationErrorException;
				use Illuminate\Validation\ValidationException;
				use App\Notifications\FriendNotification;
				use Illuminate\Http\Request;
				use \App\Http\Resources\Friend as FriendResource;

				use App\User;
				use App\Friend;
				use Auth;


				class FriendController extends Controller
				{
				    //In postman, we have to pass friend_id as we are not using RMB here.
				    public function sendRequest(Request $request)
				    {
				        $data = request()->validate([
				            'friend_id' => 'required'
				        ]);

				        /*
				            //We have to find user because here we are not using Route Model Binding.
				            //For RMB, the route would be like:
				                Route::post('/replies/{reply}/like', 'LikeController@likeIt');
				            //And the function would be like:
				                public function likeIt(Reply $reply)
				                    {
				                        $reply->likes()->create([
				                            'user_id' => auth()-> id(),
				                        ]);
				                    }
				        */
				        try {
				            $user = User::findOrFail($data['friend_id']);
				        } catch (ModelNotFoundException $e){
				            throw new UserNotFoundException();
				        }

				        /*
				            Attach is used for many to many (belongsToMany) relationship.
				            Attach will cause repeat the same values in database.
				            In the migration unique has been added which is why attach will try to add the same user_id and friend_id and it will give integrity constrain error.
				            Here, $user has the friend_if which will automatically be filled in the friends table
				        */
				        $user->friends()->syncWithoutDetaching(Auth::user());

				        /*
				            //If you want to use hasMany instead of belongsToMany you have to use create
				                $user->friends()->create([
				                    'friend_id' => $data['friend_id'], 'user_id' => auth()-> id()
				                ]);
				        */

				        $friendRequest = Friend::where('user_id', auth()->user()->id)
				            ->where('friend_id', $data['friend_id'])
				            ->first();

				        //Send notification
				        $friend = User::find($data['friend_id']);

				        $friend->notify(new FriendNotification(auth()->user()));

				        return new FriendResource($friendRequest);
				    }

				    public function confirmRequest(Request $request)
				    {
				        $data = request()->validate([
				            'user_id' => 'required',
				        ]);

				        try {
				            $friendRequest = Friend::where('user_id', $data['user_id'])
				                ->where('friend_id', auth()->user()->id)
				                ->firstOrFail();
				        } catch (ModelNotFoundException $e){
				            throw new RequestNotFoundException();
				        }

				        $friendRequest->update(array_merge($data, ['confirmed_at' => now(), 'status' => '1']));

				        return new FriendResource($friendRequest);
				    }

				    public function deleteRequest(Request $request)
				    {
				        $data = request()->validate([
				            'user_id' => 'required',
				        ]);

				        try {
				            $friendRequest = Friend::where('user_id', $data['user_id'])
				                ->where('friend_id', auth()->user()->id)
				                ->firstOrFail()
				                ->delete();
				        } catch (ModelNotFoundException $e){
				            throw new RequestNotFoundException();
				        }

				        return response()->json([], 204);
				    }
				}


		#LikeController
			php artisan make:controller LikeController

			#app->Http->Controllers->LikeController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\LikeCollection;
				use App\Notifications\LikeNotification;
				use Illuminate\Http\Request;

				use App\Post;
				use App\Like;


				class LikeController extends Controller
				{
				    public function likeDislike(Post $post)
				    {
				        //Create like
				        $post->likes()->toggle(auth()->user());

				        //Sends notification
				        $like = Like::orderby('created_at', 'desc')->first();

				        $user = $post->user;

				        if($like->user_id != $post->user_id) {
				            $user->notify(new LikeNotification($post));
				        }

				        return new LikeCollection($post->likes);
				    }
				}

		#AvatarController
			php artisan make:controller AvatarController

			#app->Http->Controllers->AvatarController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Avatar as AvatarResource;
				use Intervention\Image\Facades\Image;
				use Illuminate\Http\Request;

				class AvatarController extends Controller
				{
				    public function uploadAvatar()
				    {
				        $data = request()->validate([
				            'avatar' => 'required',
				            'width' => '',
				            'height' => '',
				            'type' => '',
				        ]);

				        //Create link to the storage and save the image there.
				        $avatar = $data['avatar']->store('uploadedAvatars', 'public');

				        //Crop image ni respect of requested height and width in case the size of image is bigger than requested width and height.
				        Image::make($data['avatar'])
				            ->fit($data['width'], $data['height'])
				            ->save(storage_path('app/public/uploadedAvatars/' . $data['avatar']->hashName()));

				        //Save the image in the database.
				        $userAvatar = auth()->user()->avatars()->create([
				            'path' => $avatar,
				            'width' => $data['width'],
				            'height' => $data['height'],
				            'type' => $data['type']
				        ]);

				        return new AvatarResource($userAvatar);
				    }
				}

		#PictureController
			php artisan make:controller PictureController

			#app->Http->Controllers->PictureController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Picture as PictureResource;
				use App\Http\Resources\Post as PostResource;
				use Illuminate\Http\Request;
				use Intervention\Image\Facades\Image;

				use App\Picture;
				use App\Post;


				class PictureController extends Controller
				{
				    public function uploadPicture()
				    {
				        $pictureData = request()->validate([
				            'picture' => 'required',
				        ]);

				        $postData = request()->validate([
				            'post_id' => '',
				            'body' => 'required'
				        ]);

				        $post = null;
				        $post = Post::find($postData['post_id']);

				        //Store or Update the post body in the posts table of database.
				        if($post != null) {
				            $post->update(['body'=> $postData['body']]);
				        } else {
				            $post = request()->user()->posts()->create($postData);
				        }

				        //Store pictures in database.
				        $pictures = $pictureData['picture'];

				        foreach ($pictures as $picture) {
				            //Create link to the storage and save the image there.
				            $storedPicture = $picture->store('uploadedPictures', 'public');

				            //Crop image in respect of requested height and width in case the size of image is bigger than requested width and height.
				            Image::make($picture)
				                ->fit(750, 750)
				                ->save(storage_path('app/public/uploadedPictures/' . $picture->hashName()));

				            //Save the picture in the pictures table of database.
				            Picture::create([
				                'path' => $storedPicture,
				                'post_id' => $post->id
				            ]);
				        }

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }
				}

		#GifController
			php artisan make:controller GifController

			#app->Http->Controllers->GifController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Comment as CommentResource;
				use App\Http\Resources\CommentCollection;
				use Illuminate\Http\Request;
				use Intervention\Image\Facades\Image;

				use App\Post;


				class GifController extends Controller
				{
				    public function uploadGif()
				    {
				        $data = request()->validate([
				            'body' => '',
				            'gif' => 'required',
				            'post_id' => 'required',
				            // Passing Height and Width from the Dropzone params.
				            'width' => '',
				            'height' => '',
				        ]);

				        //Create link to the storage and save the image there.
				        $gif = $data['gif']->store('uploadedGifs', 'public');

				        //Crop image in respect of requested height and width in case the size of image is bigger than requested width and height.
				        Image::make($data['gif'])
				            ->fit($data['width'], $data['height'])
				            ->save(storage_path('app/public/uploadedGifs/' . $data['gif']->hashName()));

				        //Save the comment in the database.
				        $comment = auth()->user()->comments()->create([
				            'body' => $data['body'],
				            'gif' => $gif,
				            'post_id' => $data['post_id'],
				        ]);

				        return new CommentResource($comment);
				    }
				}

		#ItemController
			php artisan make:controller ItemController -r

			#app->Http->Controllers->ItemController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\ItemCollection;
				use App\Http\Resources\Item as ItemResource;
				use Illuminate\Http\Request;

				use App\Item;


				class ItemController extends Controller
				{
				    public function index()
				    {
				        return new ItemCollection(Item::latest()->get());
				    }

				    public function store(Request $request)
				    {
				        $item = request()->user()->items()->create($request->all());

				        return (new ItemResource($item))->response()->setStatusCode(201);
				    }

				    public function show(Item $item)
				    {
				        return new ItemResource($item);
				    }

				    public function update(Request $request, Item $item)
				    {
				        $item->update($request->all());

				        return (new ItemResource($item))->response()->setStatusCode(201);
				    }

				    public function destroy(Item $item)
				    {
				        $item->delete();

				        return response('Deleted', 204);
				    }
				}

		#CategoryController
			php artisan make:controller CategoryController -r

			#app->Http->Controllers->CategoryController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\Category as CategoryResource;

				use App\Category;


				class CategoryController extends Controller
				{
				    public function index()
				    {
				        return CategoryResource::collection(Category::all());
				    }

				    public function store(Request $request)
				    {
				        //
				    }

				    public function show(Category $category)
				    {
				        //
				    }

				    public function edit(Category $category)
				    {
				        //
				    }

				    public function update(Request $request, Category $category)
				    {
				        //
				    }

				    public function destroy(Category $category)
				    {
				        //
				    }
				}

		#BookmarkController
			php artisan make:controller BookmarkController

			#app->Http->Controllers->BookmarkController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\BookmarkCollection;

				use App\Item;
				use App\Bookmark;


				class BookmarkController extends Controller
				{
				    public function bookmarkUnbookmark(Item $item)
				    {
				        $item->bookmarks()->toggle(auth()->user());

				        return new BookmarkCollection($item->bookmarks);
				    }
				}

		#ImageController
			php artisan make:controller ImageController

			#app->Http->Controllers->ImageController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Item as ItemResource;
				use Illuminate\Http\Request;

				use App\Image;
				use App\Item;


				class ImageController extends Controller
				{
				    public function uploadImage()
				    {
				        $imageData = request()->validate([
				            'image' => 'required',
				        ]);

				        $itemData = request()->validate([
				            'title' => 'required',
				            'description' => 'required',
				            'price' => 'required',
				            'category_id' => 'required'
				        ]);

				        $item = null;
				        //$item = Item::find($itemData['item_id']);

				        //Store or Update the post body in the posts table of database.
				        if($item != null) {
				            $item->update(['body'=> $itemData['body']]);
				        } else {
				            $item = request()->user()->items()->create($itemData);
				        }

				        //Store images in the database.
				        $images = $imageData['image'];

				        foreach ($images as $image) {
				            //Create link to the storage and save the image there.
				            $storedImage = $image->store('uploadedImages', 'public');

				            //Crop image in respect of requested height and width in case the size of image is bigger than requested width and height.
				            \Intervention\Image\Facades\Image::make($image)
				                ->fit(750, 750)
				                ->save(storage_path('app/public/uploadedImages/' . $image->hashName()));

				            //Save the picture in the pictures table of database.
				            Image::create([
				                'path' => $storedImage,
				                'item_id' => $item->id
				            ]);
				        }

				        return (new ItemResource($item))->response()->setStatusCode(201);
				    }
				}

		#ShareController
			php artisan make:controller ShareController

			#app->Http->Controllers->ShareController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\Post as PostResource;
				use App\Notifications\ShareNotification;

				use Auth;
				use App\Post;


				class ShareController extends Controller
				{
				    public function sharePost(Request $request)
				    {
				        $post = Auth::user()->posts()->create([
				            'body' => $request->body,
				            'repost_id' => $request->repost_id,
				            'user_id' => Auth::user()->id
				        ]);

				        //Send Notifications
				        $shared_post = Post::find($post->repost_id);

				        $user = $shared_post->user;

				        if($post->user_id != $shared_post->user_id) {
				            $user->notify(new ShareNotification($post));
				        }

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }
				}

		#FavouriteController
			php artisan make:controller FavouriteController

			#app->Http->Controllers->FavouriteController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\FavouriteCollection;
				use Illuminate\Http\Request;

				use App\Comment;
				use App\Favourite;
				use App\Post;


				class FavouriteController extends Controller
				{
				    /*
				        Unlike Likes and Bookmarks, Here we can not us Toogle because it is for ManyToMany and takes only one parameter(user_id).
				        Here, we have to get the type as well with user_id, which is why we used HasMany and created the entry in the DB manually.
				    */
				    public function favouriteUnfavourite(Post $post, Comment $comment, Request $request)
				    {
				        if (Favourite::where('comment_id', $comment->id)->where('user_id', auth()->id())->exists()) {
				            $comment->favourites()->where('user_id', auth()->id())->first()->delete();
				        } else {
				            $comment->favourites()->create([
				                'type' => $request->type,
				                'user_id' => auth()->id(),
				            ]);
				        }

				        return new FavouriteCollection($comment->favourites);
				    }
				}

		#FeatureController
			php artisan make:controller FeatureController

			#app->Http->Controllers->FeatureController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Post as PostResource;
				use App\Notifications\BirthdayNotification;
				use App\Notifications\TagNotification;
				use App\Notifications\WishNotification;
				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;

				use Auth;
				use App\User;
				use App\Comment;
				use App\Avatar;


				class FeatureController extends Controller
				{
				    //Easy to filter birthdays of all users in front-end by passing user's birthday(d,m,y format) and current date(d,m,y format) through resource but I'm doing it here just practice queries
				    public function filterBirthdays()
				    {
				        //Today's Birthdays - Method 1
				        $today = User::where(User::raw("(DATE_FORMAT(birthday, '%d'))"), now()->format('d'))->get(); //Or use ->paginate(5);

				        //This week's Birthdays - Method 2 (Don't display today's birthdays)
				        $users =  User::all();
				        $week =[];

				        foreach ($users as $user) {
				            if($user->birthday->format('m') == now()->format('m') and in_array($user->birthday->format('d'), range(now()->format('d') + 1, now()->format('d') + 6))) {
				                array_push($week, $user);
				            }
				        }

				        //This month's Birthdays - Method 3 (Don't display today and this week's birthdays)
				        $month = User::whereRaw('birthday LIKE "%-'. now()->format('m') .'-%"' )->where(User::raw("(DATE_FORMAT(birthday, '%d'))"), ">",  now()->format('d') + 7)->get(); //Or use ->paginate(5);

				        //Won't implement because this function is called in the create() of vue which is why it will give a new notification everytime the page is refreshed. I will have to create a new function and notify the user there.
				        //Do it like notifyTaggedUser
				        /*
				            //Send notification
				            auth()->user()->notify(new BirthdayNotification($today));
				        */

				        return [
				            'today' => UserResource::collection($today),
				            'week' => UserResource::collection($week),
				            'month' => UserResource::collection($month)
				        ];
				    }

				    //Also considered as writing on other user's wall
				    public function wishBirthday(Request $request)
				    {
				        $post = Auth::user()->posts()->create([
				            'body' => $request->body,
				            'friend_id' => $request->friend_id,
				            'user_id' => Auth::user()->id
				        ]);

				        //Send notification
				        $friend = User::find($request->friend_id);
				        $friend->notify(new WishNotification($post));

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }

				    //Send notification
				    public function notifyTaggedUser(Request $request) {
				        $tagged_user_id = $request->tagged_user_id;
				        $tagged_comment_id = $request->tagged_comment_id;

				        if($tagged_user_id != null && $tagged_user_id != Auth::user()->id) {
				            $tagged_user = User::find($tagged_user_id);
				            $tagged_comment = Comment::find($tagged_comment_id);
				            $tagged_user->notify(new TagNotification($tagged_comment));
				        }
				    }

				    public function getAllAvatars(Request $request)
				    {
				        $user_id = $request->user_id;

				        $avatars = Avatar::where('user_id', $user_id)->get();

				        return $avatars;
				    }
				}


		#NotificationController
			php artisan make:controller NotificationController

			#app->Http->Controllers->NotificationController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\Notification as NotificationResource;
				use Illuminate\Support\Facades\DB;

				class NotificationController extends Controller
				{
				    public function index()
				    {
				        return [
				            'all' => NotificationResource::collection(auth()->user()->notifications),
				            'read' => NotificationResource::collection(auth()->user()->readNotifications),
				            'unread' => NotificationResource::collection(auth()->user()->unreadNotifications)
				        ];
				    }

				    public function markAsRead(Request $request)
				    {
				        auth()->user()->notifications->where('id', $request->id)->markAsRead();
				    }

				    public function hideFriendButtons(Request $request)
				    {
				        $notification = auth()->user()->notifications->where('id', $request->id)->first();
				        $data = $notification->data;
				        $notification->update(array('data' => array_merge($data, ['content' => $request->content, 'message' => $request->message])));
				    }
				}

		#SearchController
			php artisan make:controller SearchController

			#app->Http->Controllers->SearchController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;
				use App\User;

				class SearchController extends Controller
				{
				    public function getUsers(Request $request)
				    {
				        $myString = $request->searchTerm;

				        $searchResult = User::where('name', 'like', "%$myString%")->get();

				        return UserResource::collection($searchResult);

				        /* //If want to get search from the whole table which also includes email
				            $searchResult = User::search($request->searchTerm)->where('user_id', request()->user()->id)->get();

				            return UserResource::collection($searchResult);
				        */
				    }
				}


4) Exception Handling
	#RequestNotFoundException
		php artisan make:exception RequestNotFoundException --render

		#app->Exceptions->RequestNotFoundException.php
			<?php

			namespace App\Exceptions;

			use Exception;

			class RequestNotFoundException extends Exception
			{
			    public function render($request)
			    {
			        return response()->json([
			            'errors' => [
			                'code' => 404,
			                'title' => 'Friend Request not found',
			                'detail' => 'Unable to locate friend request with given information'
			            ]
			        ], 404);
			    }
			}

	#UserNotFoundException
		php artisan make:exception UserNotFoundException --render

		#app->Exceptions->UserNotFoundException.php
			<?php

			namespace App\Exceptions;

			use Exception;

			class UserNotFoundException extends Exception
			{
			    public function render($request)
			    {
			        return response()->json([
			            'errors' => [
			                'code' => 404,
			                'title' => 'User not found',
			                'detail' => 'Unable to locate user with given information'
			            ]
			        ], 404);
			    }
			}

	#ValidationErrorException
		php artisan make:exception ValidationErrorException --render

		#app->Exceptions->ValidationErrorException.php
			<?php

			namespace App\Exceptions;

			use Exception;

			class ValidationErrorException extends Exception
			{
			    public function render($request)
			    {
			        return response()->json([
			            'errors' => [
			                'code' => 422,
			                'title' => 'Validated field not found',
			                'detail' => 'Unable to fetch required fields with given information',
			                'meta' => json_decode($this->getMessage()) //Convert back the string into the array
			            ]
			        ], 422);
			    }
			}

	#Handle ValidationErrorException
		#app->Exceptions->Handler.php

			...
			public function render($request, Throwable $exception)
		    {
		        if ($exception instanceof ValidationException) {
		            throw new ValidationErrorException(json_encode($exception->errors())); //It only accepts string so we have to convert array into a string
		        }

		        return parent::render($request, $exception);
		    }



5) Perform testing
	[5.1] Setup tessting enviornment
		#Make sure connection is set to sqlite
			#phpunit.xml
				<server name="DB_CONNECTION" value="sqlite"/>
        		<server name="DB_DATABASE" value=":memory:"/>

        	#Modify the command to avoid writing the whole command
        		alias pu="clear && vendor/bin/phpunit"  
        		alias pf="clear && vendor/bin/phpunit --filter" 

   	[5.2] Testing for auth
		php artisan make:test AuthTest

		#tests->Feature->AuthTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Support\Facades\Artisan;
			use Illuminate\Support\Facades\Storage;
			use Tests\TestCase;

			use App\User;
			use App\Post;
			use Carbon\Carbon;

			class AuthTest extends TestCase
			{
			    use RefreshDatabase;

			    protected $user;
			    protected $token;
			    protected $server;

			    protected function setUp(): void
			    {
			        parent::setUp();

			        Artisan::call('passport:install',['-vvv' => true]);

			        $this->user = factory(User::class)->create();

			        $this->token = $this->user->createToken('MyApp')->accessToken;

			        $this->server = [
			            'HTTP_Authorization' => 'Bearer '. $this->token
			        ];
			    }

			    private function registerData()
			    {
			        return [
			            'name' => 'user',
			            'email' => 'user@test.com',
			            'city' => 'New York',
			            'gender' => 'male',
			            'birthday' => '1996/05/27',
			            'interest' => 'female',
			            'about' => 'Hi, My name is Jay.I like football.',
			            'password' => 'password',
			            'confirm_password' => 'password'
			        ];
			    }

			    private function loginData()
			    {
			        return [
			            'email' => $this->user->email,
			            'password' => 'password',
			        ];
			    }

			    private function postData()
			    {
			        return [
			            'body' => 'This is a new post.',
			        ];
			    }

			    /** @test */
			    public function unregistered_user_can_register()
			    {
			        $response = $this->post('/api/register', $this->registerData());

			        $response->assertStatus(200);

			        $this->assertCount(2, User::all());

			        $users = User::all();
			        $user = $users->last();

			        $this->assertEquals('user', $user->name);
			        $this->assertEquals('user@test.com', $user->email);
			    }

			    /** @test */
			    public function registered_user_can_login()
			    {
			        $response = $this->post('/api/login', $this->loginData());

			        $response->assertStatus(200);

			        $this->assertCount(1, User::all());

			        $user = User::first();

			        $this->assertEquals($this->user->name, $user->name);
			        $this->assertEquals($this->user->email, $user->email);
			    }

			    /** @test */
			    public function auth_user_can_create_new_post()
			    {
			        //$this->actingAs($user = factory(User::class)->create(), 'api'); Not required as we are passing the token manually.

			        $response = $this->post('/api/posts', $this->postData(), $this->server);

			        $response->assertStatus(201);

			        $this->assertCount(1, Post::all());
			    }

			    /** @test */
			    public function auth_user_can_logout()
			    {
			        //Body if not necessary but it is important to add it for best practice.
			        $response = $this->post('/api/logout', [],  $this->server);

			        $response->assertStatus(200);
			    }
			}


    [5.3] Testing for posts, shared posts and likes
    	php artisan make:test PostTest 

    	#tests->Feature->PostTest.php
			<?php

			namespace Tests\Feature;


			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Http\UploadedFile;
			use Illuminate\Support\Facades\Storage;
			use Illuminate\Support\Facades\Artisan;
			use App\Http\Resources\UserResource;
			use Tests\TestCase;

			use App\User;
			use App\Post;
			use App\Friend;
			use App\Picture;

			class PostTest extends TestCase
			{
			    use RefreshDatabase;

			    protected $user;
			    protected $token;
			    protected $server;

			    protected $post;

			    protected function setUp(): void
			    {
			        parent::setUp();

			        Artisan::call('passport:install',['-vvv' => true]);

			        $this->user = factory(User::class)->create();

			        $this->token = $this->user->createToken('MyApp')->accessToken;

			        $this->server = [
			            'HTTP_Authorization' => 'Bearer '. $this->token
			        ];

			        Storage::fake('public');
			    }

			    private function postData()
			    {
			        return [
			            'body' => 'This is a new post.',
			        ];
			    }

			    /** @test */
			    //actingAs is another way to login if you don't want pass the token
			    public function auth_user_can_fetch_all_posts_including_his_friends()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $posts = factory(Post::class, 2)->create(['user_id' => $user2->id]);

			        Friend::create([
			            'user_id' => $user1->id,
			            'friend_id' => $user2->id,
			            'confirmed_at' => now(),
			            'status' => 1
			        ]);

			        $response = $this->get('/api/posts');

			        $response->assertJson([
			            'data' => [
			                [
			                    'id' => $posts->first()->id,
			                    'body' => $posts->first()->body,
			                    'user_id' => $posts->first()->user_id,
			                    'created_at' => $posts->first()->created_at->diffForHumans(),

			                    'comments' => [],

			                    'likes' => [],

			                    'pictures' => [],

			                    'shared_post' => null,
			                    'shared_count' => 0,

			                    'posted_on' => null,

			                    'posted_by' => [
			                        'id' => $user2->id,
			                        'name' => $user2->name,
			                        'email' => $user2->email,
			                    ],

			                    'path' => $posts->first()->path
			                ],
			                [
			                    'id' => $posts->last()->id,
			                    'body' => $posts->last()->body,
			                    'user_id' => $posts->last()->user_id,
			                    'created_at' => $posts->last()->created_at->diffForHumans(),

			                    'comments' => [],

			                    'likes' => [],

			                    'pictures' => [],

			                    'shared_post' => null,
			                    'shared_count' => 0,

			                    'posted_on' => null,

			                    'posted_by' => [
			                        'id' => $user2->id,
			                        'name' => $user2->name,
			                        'email' => $user2->email,
			                    ],

			                    'path' => $posts->last()->path
			                ]
			            ],
			            'links' => [
			                'self' => '/posts'
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_cannot_fetch_others_posts()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api');

			        $user2 = factory(User::class)->create();

			        $posts = factory(Post::class, 2)->create(['user_id' => $user2->id]); //These posts do not belong to logged in user

			        $response = $this->get('/api/posts');

			        $response->assertExactJson([
			            'data' => [],
			            'links' => [
			                'self' => '/posts'
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_create_text_post()
			    {   //One way to create a post
			        $post = factory(Post::class)->create(['user_id' => $this->user->id]);

			        //Second way to create a post
			        $response = $this->post('/api/posts', $this->postData(), $this->server);

			        $response->assertStatus(201);

			        $this->assertCount(2, Post::all());

			        $posts = Post::all();
			        $post = $posts->last();

			        $this->assertEquals('This is a new post.', $post->body);
			        $this->assertEquals($post->user_id, $this->user->id);

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => $post->body,
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => null,
			                'shared_count' => 0,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $this->user->id,
			                    'name' => $this->user->name,
			                    'email' => $this->user->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_create_single_picture_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('postImage.jpg');

			        $response = $this->post('/api/upload-pictures', [
			            'body' => 'test Body',
			            'picture' => [$file],
			            'post_id' => null,
			            'user_id' => $user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedPictures/' . $file->hashName());

			        $this->assertCount(1, Post::all());
			        $this->assertCount(1, Picture::all());

			        $post = Post::first();
			        $picture = Picture::first();

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => $post->body,
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [
			                    'data' => [
			                        [
			                            'id' => $picture->id,
			                            'path' => $picture->path,
			                        ]
			                    ],

			                    'picture_count' => 1,

			                    'links' => [
			                        'self' => '/posts'
			                    ]
			                ],

			                'shared_post' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_create_multiple_pictures_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file1 = UploadedFile::fake()->image('postImage1.jpg');
			        $file2 = UploadedFile::fake()->image('postImage2.jpg');
			        $file3 = UploadedFile::fake()->image('postImage3.jpg');

			        $response = $this->post('/api/upload-pictures', [
			            'body' => 'test Body',
			            'picture' => [$file1, $file2, $file3],
			            'post_id' => null,
			            'user_id' => $user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedPictures/' . $file1->hashName());
			        Storage::disk('public')->assertExists('uploadedPictures/' . $file2->hashName());
			        Storage::disk('public')->assertExists('uploadedPictures/' . $file3->hashName());

			        $this->assertCount(1, Post::all());
			        $this->assertCount(3, Picture::all());

			        $post = Post::first();
			        $pictures = Picture::all();
			        $picture1 = $pictures[0];
			        $picture2 = $pictures[1];
			        $picture3 = $pictures[2];

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => $post->body,
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [
			                    'data' => [
			                        [
			                            'id' => $picture1->id,
			                            'path' => $picture1->path,
			                        ],
			                        [
			                            'id' => $picture2->id,
			                            'path' => $picture2->path,
			                        ],
			                        [
			                            'id' => $picture3->id,
			                            'path' => $picture3->path,
			                        ],
			                    ],

			                    'picture_count' => 3,

			                    'links' => [
			                        'self' => '/posts'
			                    ]
			                ],

			                'shared_post' => null,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_update_text_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['user_id' => $user->id]);

			        $response = $this->put('/api/posts/' . $post->id, ['body' => 'An updated post']);

			        $response->assertStatus(201);

			        $post = Post::first();

			        $this->assertEquals('An updated post', $post->body);

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => 'An updated post',
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => null,
			                'shared_count' => 0,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_update_post_with_picture()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('postImage.jpg');

			        $post = factory(Post::class)->create(['user_id' => $user->id]);

			        $response = $this->post('/api/upload-pictures', [
			            'body' => 'An updated post',
			            'picture' => [$file],
			            'post_id' => $post->id,
			            'user_id' => $user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedPictures/' . $file->hashName());

			        $this->assertCount(1, Post::all());
			        $this->assertCount(1, Picture::all());

			        $post = Post::first();
			        $picture = Picture::first();

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => 'An updated post',
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [
			                    'data' => [
			                        [
			                            'id' => $picture->id,
			                            'path' => $picture->path,
			                        ]
			                    ],

			                    'picture_count' => 1,

			                    'links' => [
			                        'self' => '/posts'
			                    ]
			                ],

			                'shared_post' => null,
			                'shared_count' => 0,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_delete_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['user_id' => $user->id]);

			        $response = $this->delete('/api/posts/' . $post->id);

			        $response->assertStatus(204);

			        $posts = Post::all();

			        $this->assertCount(0, $posts);
			    }

			    /** @test */
			    public function auth_user_can_like_a_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $response = $this->post('/api/posts/' . $post->id . '/like-dislike');

			        $response->assertStatus(200);

			        $this->assertCount(1, $user->likes);

			        $response->assertJson([
			            'data' => [
			                [
			                    'created_at' => now()->diffForHumans(),
			                    'post_id' => $post->id,
			                    'path' => '/posts/' . $post->id,
			                ]
			            ],
			            'like_count' => 1,
			            'user_liked' => true,
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    public function posts_are_returned_with_likes()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123, 'user_id' => $user->id]);

			        $this->post('/api/posts/' . $post->id . '/like-dislike')->assertStatus(200);;

			        $response = $this->get('/api/posts');

			        $response->assertStatus(200);

			        $response->assertJson([
			            'data' => [
			                [
			                    'id' => $post->first()->id,
			                    'body' => $post->first()->body,
			                    'user_id' => $post->first()->user_id,
			                    'created_at' => $post->first()->created_at->diffForHumans(),

			                    'comments' => [],

			                    'likes' => [
			                        'data' => [
			                            [
			                                'created_at' => now()->diffForHumans(),
			                                'post_id' => $post->id,
			                                'path' => '/posts/' . $post->id,
			                            ]
			                        ],
			                        'like_count' => 1,
			                        'user_liked' => true,
			                        'links' => [
			                            'self' => '/posts',
			                        ]
			                    ],

			                    'pictures' => [],

			                    'shared_post' => null,
			                    'shared_count' => 0,

			                    'posted_on' => null,

			                    'posted_by' => [
			                        'id' => $user->id,
			                        'name' => $user->name,
			                        'email' => $user->email,
			                    ],

			                    'path' => $post->first()->path
			                ],
			            ],
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_share_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['user_id' => $user->id]);

			        $response = $this->post('/api/share-post', [
			            'body' => 'A new body for shared post',
			            'repost_id' => $post->id,
			            'user_id' => $user->id
			        ]);

			        $response->assertStatus(201);

			        $posts = Post::all();
			        $post1 = $posts[0]; //$post which is created using factory above
			        $post2 = $posts[1]; //Recently created shared post

			        $this->assertCount(2, $posts);

			        $response->assertJson([
			            'data' => [
			                'id' => $post2->id,
			                'body' => 'A new body for shared post',
			                'user_id' => $post2->user_id,
			                'created_at' => $post2->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => [
			                    'id' => $post1->id,
			                    'body' => $post1->body,
			                    'user_id' => $post1->user_id,
			                    'created_at' => $post1->created_at->diffForHumans(),

			                    'comments' => [],

			                    'likes' => [],

			                    'pictures' => [
			                        'data' => [],

			                        'picture_count' => 0,

			                        'links' => [
			                            'self' => '/posts'
			                        ]
			                    ],

			                    'posted_on' => null,

			                    'posted_by' => [
			                        'id' => $user->id,
			                        'name' => $user->name,
			                        'email' => $user->email,
			                    ]
			                ],
			                'shared_count' => 0,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post2->path
			            ]
			        ]);

			        //To check if the original post's shared count in increased on not
			        $this->get('/api/posts')->assertJson([
			        'data' => [
			            [
			                'id' => $post1->id,
			                'body' => $post1->body,
			                'user_id' => $post1->user_id,
			                'created_at' => $post1->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => [],
			                'shared_count' => 1,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post1->path
			            ],
			            [
			                'id' => $post2->id,
			                'body' => $post2->body,
			                'user_id' => $post2->user_id,
			                'created_at' => $post2->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => [
			                    'id' => $post1->id,
			                    'body' => $post1->body,
			                    'user_id' => $post1->user_id,
			                    'created_at' => $post1->created_at->diffForHumans(),

			                    'comments' => [],

			                    'likes' => [],

			                    'pictures' => [
			                        'data' => [],

			                        'picture_count' => 0,

			                        'links' => [
			                            'self' => '/posts'
			                        ]
			                    ],

			                    'posted_on' => null,

			                    'posted_by' => [
			                        'id' => $user->id,
			                        'name' => $user->name,
			                        'email' => $user->email,
			                    ]
			                ],
			                'shared_count' => 0,

			                'posted_on' => null,

			                'posted_by' => [
			                    'id' => $user->id,
			                    'name' => $user->name,
			                    'email' => $user->email,
			                ],

			                'path' => $post2->path
			            ],
			        ],
			        'links' => [
			            'self' => '/posts'
			        ]
			    ]);;

			    }

			    /** @test */
			    public function auth_user_can_create_text_post_on_newsfeed_of_other_user()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $response = $this->post('/api/posts', ['body' => 'Happy birthday my friend', 'friend_id' => $user2->id, 'user_id' => $user1->id]);

			        $response->assertStatus(201);

			        $this->assertCount(1, Post::all());

			        $post = Post::first();

			        $this->assertEquals('Happy birthday my friend', $post->body);
			        $this->assertEquals($post->friend_id, $user2->id);

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => $post->body,
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => null,
			                'shared_count' => 0,

			                'posted_on' => [
			                    'id' => $user2->id,
			                    'name' => $user2->name,
			                    'email' => $user2->email,
			                ],

			                'posted_by' => [
			                    'id' => $user1->id,
			                    'name' => $user1->name,
			                    'email' => $user1->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function body_is_required_for_a_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $response = $this->post('/api/posts');

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey('body', $responseString['errors']['meta']);
			    }
			}


	[5.4] Testing for comments, gif and favourites
    	php artisan make:test CommentTest 

    	#tests->Feature->CommentTest.php
    		<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Http\UploadedFile;
			use Illuminate\Support\Facades\Storage;
			use Tests\TestCase;

			use App\Comment;
			use App\Post;
			use App\User;
			use App\Gif;


			class CommentTest extends TestCase
			{
			    use RefreshDatabase;

			    /** @test */
			    public function posts_are_returned_with_comments()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123, 'user_id' => $user->id]);

			        $this->post('/api/posts/' . $post->id . '/comments', ['body' => 'A new comment here!'])->assertStatus(200);;

			        $response = $this->get('/api/posts');

			        $response->assertStatus(200);

			        $comment = Comment::first();

			        $this->assertCount(1, Comment::all());

			        $this->assertEquals($user->id, $comment->user_id);
			        $this->assertEquals($post->id, $comment->post_id);

			        $response->assertJson([
			            'data' => [
			                [
			                    'id' => 123,
			                    'body' => $post->first()->body,
			                    'user_id' => $post->first()->user_id,
			                    'created_at' => $post->first()->created_at->diffForHumans(),

			                    'comments' => [
			                        'data' => [
			                            [
			                                'body' => 'A new comment here!',
			                                'updated_at' => now()->diffForHumans(),
			                                'commented_by' => [
			                                    'name' => $user->name,
			                                    'email' => $user->email
			                                ],
			                                'path' => '/posts/' . $post->id . '/comments/' . $comment->id,
			                            ]
			                        ],
			                        'comment_count' => 1,
			                        'links' => [
			                            'self' => '/posts',
			                        ],
			                    ],

			                    'likes' => [],

			                    'pictures' => [],

			                    'shared_post' => null,

			                    'posted_by' => [
			                        'id' => $user->id,
			                        'name' => $user->name,
			                        'email' => $user->email,
			                    ],

			                    'path' => $post->first()->path
			                ],
			            ],
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_create_a_text_comment()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $response = $this->post('/api/posts/' . $post->id . '/comments', ['body' => 'A new comment here!']);

			        $response->assertStatus(200);

			        $comment = Comment::first();

			        $this->assertCount(1, Comment::all());

			        $this->assertEquals($user->id, $comment->user_id);
			        $this->assertEquals($post->id, $comment->post_id);

			        $response->assertJson([
			            'data' => [
			                [
			                    'body' => 'A new comment here!',
			                    'post_id' => $post->id,
			                    'updated_at' => now()->diffForHumans(),
			                    'commented_by' => [
			                        'name' => $user->name,
			                        'email' => $user->email
			                    ],
			                    'path' => '/posts/' . $post->id . '/comments/' . $comment->id,
			                ]
			            ],
			            'comment_count' => 1,
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_create_a_gif_comment()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $file = UploadedFile::fake()->image('commentGif.jpg');

			        $response = $this->post('/api/upload-gif', [
			            'body' => 'A new comment here!',
			            'gif' => $file, //Unlike Pictures and Images, here it would be only $file rather than [$file] because gif is inside the Comment Model and hasOne relationship.
			            'post_id' => $post->id,
			            'user_id' => $user->id,
			            // Passing Height and Width from the Dropzone params.
			            'width' => 250,
			            'height' => 250,
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedGifs/' . $file->hashName());

			        $this->assertCount(1, Comment::all());

			        $comment = Comment::first();

			        //In GifController we are returning CommentResource rather than collection, which is why the Json will differ.
			        $response->assertJson([
			            'data' => [
			                'body' => 'A new comment here!',
			                'gif' => $comment->gif,
			                'post_id' => $post->id,
			                'updated_at' => now()->diffForHumans(),

			                'favourites' => [],
			                'user_favourited' => false,
			                'favourited_type' => [],

			                'commented_by' => [
			                    'name' => $user->name,
			                    'email' => $user->email
			                ],
			                'path' => '/posts/' . $post->id . '/comments/' . $comment->id,
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_edit_a_text_comment()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $comment = factory(Comment::class)->create(['id' => 123, 'post_id' => $post->id]);

			        $response = $this->put('/api/posts/' . $post->id . '/comments/' . $comment->id, ['body' => 'An edited comment here!']);

			        $response->assertStatus(200);

			        $comment = Comment::first();

			        $this->assertCount(1, Comment::all());

			        $this->assertEquals($user->id, $comment->user_id);
			        $this->assertEquals($post->id, $comment->post_id);
			        $this->assertEquals($comment->body, 'An edited comment here!');

			        $response->assertJson([
			            'data' => [
			                [
			                    'body' => 'An edited comment here!',
			                    'post_id' => 123,
			                    'updated_at' => now()->diffForHumans(),
			                    'commented_by' => [
			                        'name' => $user->name,
			                        'email' => $user->email
			                    ],
			                    'path' => '/posts/' . $post->id . '/comments/' . $comment->id,
			                ]
			            ],
			            'comment_count' => 1,
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    /*public function auth_user_can_edit_a_gif_comment()
			    {

			    }*/

			    /** @test */
			    public function auth_user_can_delete_a_comment()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $comment = factory(Comment::class)->create(['id' => 123, 'post_id' => $post->id]);

			        $response = $this->delete('/api/posts/' . $post->id . '/comments/' . $comment->id);

			        $response->assertStatus(204);

			        $this->assertCount(0, Comment::all());
			    }

			    /** @test */
			    public function auth_user_can_favourite_a_comment()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api');

			        $post = factory(Post::class)->create(['id' => 123]);

			        $comment = factory(Comment::class)->create(['id' => 123, 'post_id' => $post->id]);

			        $response = $this->post('/api/posts/' . $post->id . '/comments/' . $comment->id . '/favourite-unfavourite', ['type' => 2]);

			        $response->assertStatus(200);

			        $this->assertCount(1, $comment->favourites);

			        $response->assertJson([
			            'data' => [
			                [
			                    'type' => 2,
			                    'comment_id' => $comment->id,
			                    'user_id' => $user->id,
			                    'created_at' => now()->diffForHumans(),
			                ]
			            ],
			            'favourite_count' => 1,
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    public function body_is_required_for_a_text_comment()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $response = $this->post('/api/posts/' . $post->id . '/comments');

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey('body', $responseString['errors']['meta']);
			    }

			    /** @test */
			    public function body_is_not_required_for_a_gif_comment()
			    {
			        $this->withoutExceptionHandling();
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $file = UploadedFile::fake()->image('commentGif.jpg');

			        $response = $this->post('/api/upload-gif', [
			            'body' => '', //Body is not required for comment and Dropzone will directly post the comment once gif is uploaded as body in comment table has been made nullable. User can't post an empty comment as well because without gif and body, the Post button won't show up to actually post the comment.
			            'gif' => $file, //Unlike Pictures and Images, here it would be only $file rather than [$file] because gif is inside the Comment Model and hasOne relationship.
			            'post_id' => $post->id,
			            'user_id' => $user->id,
			            // Passing Height and Width from the Dropzone params.
			            'width' => 250,
			            'height' => 250,
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedGifs/' . $file->hashName());

			        $this->assertCount(1, Comment::all());
			    }
			}


	[5.5] Testing for user, avatars and friend-request 
		php artisan make:test UserTest

		#tests->Feature->UserTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Illuminate\Support\Facades\Storage;
			use Illuminate\Http\UploadedFile;
			use App\Http\Resources\UserResource;
			use Tests\TestCase;
			use Carbon\Carbon;

			use App\Post;
			use App\User;
			use App\Friend;
			use App\Avatar;


			class UserTest extends TestCase
			{
			    use RefreshDatabase;


			    protected function setUp(): void
			    {
			        parent::setUp();

			        Storage::fake('public');
			    }

			    /** @test */
			    public function auth_user_can_be_fetched()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->post('/api/me');

			        $response->assertStatus(200);

			        $response->assertJson([
			            'id' => $user->id,
			            'name' => $user->name,
			            'email' => $user->email,
			            'city' => $user->city,
			            'gender' => $user->gender,
			            'birthday' => [
			                'when' => $user->birthday->format('d') - Carbon::now()->format('d'),
			                'age' => Carbon::now()->format('Y') - $user->birthday->format('Y'),
			                'day_name' => $user->birthday->format('l'),
			                'day' => $user->birthday->day,
			                'month' => $user->birthday->month,
			                'year' => $user->birthday->year,
			            ],
			            'interest' => $user->interest,
			            'about' => $user->about,

			            'friendship' => [],

			            //This is default settings when no cover pic is uploaded
			            'cover_image' => [
			                'path' => 'uploadedAvatars/cover.jpg',
			                'width' => 1500,
			                'height' => 500,
			                'type' => 'cover',
			            ],

			            //This is default settings when no profile pic is uploaded
			            'profile_image' => [
			                'path' => 'uploadedAvatars/profile.jpg',
			                'width' => 750,
			                'height' => 750,
			                'type' => 'profile',
			            ],

			            'path' => $user->path
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_check_user_profiles_and_posts()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $posts = factory(Post::class, 2)->create(['user_id' => $user->id]);

			        $response = $this->get('/api/users/' . $user->id);

			        $response->assertStatus(200);

			        $response->assertJson([
			            [
			                'id' => $user->id,
			                'name' => $user->name,
			                'email' => $user->email,
			                'city' => $user->city,
			                'gender' => $user->gender,
			                'birthday' => [
			                    'when' => $user->birthday->format('d') - Carbon::now()->format('d'),
			                    'age' => Carbon::now()->format('Y') - $user->birthday->format('Y'),
			                    'day_name' => $user->birthday->format('l'),
			                    'day' => $user->birthday->day,
			                    'month' => $user->birthday->month,
			                    'year' => $user->birthday->year,
			                ],
			                'interest' => $user->interest,
			                'about' => $user->about,

			                'friendship' => [],

			                //This is default settings when no cover pic is uploaded
			                'cover_image' => [
			                    'path' => 'uploadedAvatars/cover.jpg',
			                    'width' => 1500,
			                    'height' => 500,
			                    'type' => 'cover',
			                ],

			                //This is default settings when no profile pic is uploaded
			                'profile_image' => [
			                    'path' => 'uploadedAvatars/profile.jpg',
			                    'width' => 750,
			                    'height' => 750,
			                    'type' => 'profile',
			                ],

			                'path' => $user->path
			            ],
			            [
			                'data' => [
			                    [
			                        'id' => $posts->first()->id,
			                        'body' => $posts->first()->body,
			                        'user_id' => $posts->first()->user_id,
			                        'created_at' => $posts->first()->created_at->diffForHumans(),

			                        'comments' => [],

			                        'likes' => [],

			                        'pictures' => [],

			                        'shared_post' => null,

			                        'posted_by' => [
			                            'id' => $user->id,
			                            'name' => $user->name,
			                            'email' => $user->email,
			                        ],

			                        'path' => $posts->first()->path
			                    ],
			                    [
			                        'id' => $posts->last()->id,
			                        'body' => $posts->last()->body,
			                        'user_id' => $posts->last()->user_id,
			                        'created_at' => $posts->last()->created_at->diffForHumans(),

			                        'comments' => [],

			                        'likes' => [],

			                        'pictures' => [],

			                        'shared_post' => null,

			                        'posted_on' => null,

			                        'posted_by' => [
			                            'id' => $user->id,
			                            'name' => $user->name,
			                            'email' => $user->email,
			                        ],

			                        'path' => $posts->last()->path
			                    ]
			                ],
			                'links' => [
			                    'self' => '/posts'
			                ]
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_upload_avatar()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('image.jpg');

			        $response = $this->post('/api/upload-avatars', [
			            'avatar' => $file,
			            'width' => '850',
			            'height' => '300',
			            'type' => 'cover'
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedAvatars/' . $file->hashName());

			        $avatar = Avatar::first();

			        $this->assertEquals('uploadedAvatars/' . $file->hashName(), $avatar->path);
			        $this->assertEquals('850', $avatar->width);
			        $this->assertEquals('300', $avatar->height);
			        $this->assertEquals('cover', $avatar->type);

			        $response->assertJson([
			            'data' => [
			                'path' => $avatar->path,
			                'width' => $avatar->width,
			                'height' => $avatar->height,
			                'type' => $avatar->type,
			            ]
			        ]);
			    }

			    /** @test */
			    public function users_are_fetched_with_their_avatars()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('avatar.jpg');

			        $this->post('/api/upload-avatars', [
			            'avatar' => $file,
			            'width' => 850,
			            'height' => 300,
			            'type' => 'cover'
			        ])->assertStatus(201);

			        $this->post('/api/upload-avatars', [
			            'avatar' => $file,
			            'width' => 400,
			            'height' => 400,
			            'type' => 'profile'
			        ])->assertStatus(201);

			        $uploadedAvatars = Avatar::all();
			        $coverAvatar = $uploadedAvatars[0];
			        $profileAvatar = $uploadedAvatars[1];

			        $response = $this->get('/api/users/' . $user->id);

			        $response->assertJson([
			            [
			                'id' => $user->id,
			                'name' => $user->name,
			                'email' => $user->email,
			                'city' => $user->city,
			                'gender' => $user->gender,
			                'birthday' => [
			                    'when' => $user->birthday->format('d') - Carbon::now()->format('d'),
			                    'age' => Carbon::now()->format('Y') - $user->birthday->format('Y'),
			                    'day_name' => $user->birthday->format('l'),
			                    'day' => $user->birthday->day,
			                    'month' => $user->birthday->month,
			                    'year' => $user->birthday->year,
			                ],
			                'interest' => $user->interest,
			                'about' => $user->about,

			                'friendship' => [],

			                'cover_image' => [
			                    'path' => $coverAvatar->path,
			                    'width' => $coverAvatar->width,
			                    'height' => $coverAvatar->height,
			                    'type' => $coverAvatar->type,
			                ],

			                'profile_image' => [
			                    'path' => $profileAvatar->path,
			                    'width' => $profileAvatar->width,
			                    'height' => $profileAvatar->height,
			                    'type' => $profileAvatar->type,
			                ],

			                'path' => $user->path
			            ],
			            [
			                'data' =>[],
			                'links' => [
			                    'self' => '/posts'
			                ]
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_send_friend_request()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $response = $this->post('/api/send-request', ['friend_id' => $user2->id]);

			        $response->assertStatus(200);

			        $friendRequest = Friend::first(); //To grab first row from the friend's table

			        $this->assertNotNull($friendRequest);
			        $this->assertEquals($user2->id, $friendRequest->friend_id);
			        $this->assertEquals($user1->id, $friendRequest->user_id);

			        $response->assertJson([
			            'data' => [
			                'id' => $friendRequest->id,
			                'status' => $friendRequest->status, //NULL
			                'confirmed_at' => $friendRequest->confirmed_at, //NULL
			                'path' => '/users/'.$friendRequest->friend_id
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_accept_friend_request()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $response1 = $this->post('/api/send-request', ['friend_id' => $user2->id]);

			        $this->actingAs($user2, 'api'); //It just logs in the user

			        $response2 = $this->post('/api/confirm-request', ['user_id' => $user1->id]);

			        $response2->assertStatus(200);

			        $friendRequest = Friend::first(); //To grab first row from the friend's table

			        $this->assertNotNull($friendRequest->confirmed_at);
			        $this->assertNotNull($friendRequest->status);

			        $this->assertInstanceOf(Carbon::class, $friendRequest->confirmed_at);

			        $this->assertEquals(now()->startOfSecond(), $friendRequest->confirmed_at);

			        $this->assertEquals(1, $friendRequest->status);

			        $response2->assertJson([
			            'data' => [
			                'id' => $friendRequest->id,
			                'status' => $friendRequest->status,
			                'confirmed_at' => $friendRequest->confirmed_at->diffForHumans(),
			                'friend_id' => $friendRequest->friend_id,
			                'user_id' => $friendRequest->user_id,
			                'path' => '/users/'.$friendRequest->friend_id
			            ]
			        ]);
			    }

			    /** @test */
			    public function only_valid_users_can_send_friend_request()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->post('/api/send-request', ['friend_id' => 123]);

			        $friendRequest = Friend::first(); //To grab first row from the friend's table

			        $this->assertNull($friendRequest);

			        $response->assertStatus(404);

			        $response->assertJson([
			            'errors' => [
			                'code' => 404,
			                'title' => 'User not found',
			                'detail' => 'Unable to locate user with given information'
			            ]
			        ]);
			    }

			    /** @test */
			    public function only_valid_friend_requests_can_be_accepted()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->post('/api/confirm-request', ['user_id' => 123]);

			        $friendRequest = Friend::first(); //To grab first row from the friend's table

			        $this->assertNull($friendRequest);

			        $response->assertStatus(404);

			        $response->assertJson([
			            'errors' => [
			                'code' => 404,
			                'title' => 'Friend Request not found',
			                'detail' => 'Unable to locate friend request with given information'
			            ]
			        ]);
			    }

			    /** @test */
			    public function third_party_user_cannot_accept_the_request()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $response1 = $this->post('/api/send-request', ['friend_id' => $user2->id]);

			        $response1->assertStatus(200);

			        $user3 = factory(User::class)->create();

			        $this->actingAs($user3, 'api');

			        $response2 = $this->post('/api/confirm-request', ['user_id' => $user1->id]);

			        $response2->assertStatus(404);

			        $friendRequest = Friend::first();

			        $this->assertEquals(null, $friendRequest->confirmed_at);

			        $this->assertEquals(null, $friendRequest->status);

			        $response2->assertJson([
			            'errors' => [
			                'code' => 404,
			                'title' => 'Friend Request not found',
			                'detail' => 'Unable to locate friend request with given information'
			            ]
			        ]);
			    }

			    /** @test */
			    public function friend_id_is_required_to_send_request()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->post('/api/send-request', ['friend_id' => '']);

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey('friend_id', $responseString['errors']['meta']);
			    }

			    /** @test */
			    public function user_id_is_required_to_confirm_request()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->post('/api/confirm-request', ['user_id' => '']);

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey('user_id', $responseString['errors']['meta']);
			    }

			    /** @test */
			    public function friendships_can_be_fetched_in_the_profile()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        //Another way without post response
			        $friendRequest = Friend::create([
			            'user_id' => $user1->id,
			            'friend_id' => $user2->id,
			            'confirmed_at' => now()->subDay(),
			            'status' => 1
			        ]);

			        $response = $this->get('/api/users/' . $user2->id);

			        $response->assertStatus(200);

			        $response->assertJson([
			            [
			                'id' => $user2->id,
			                'name' => $user2->name,
			                'email' => $user2->email,
			                'friendship' => [
			                    'confirmed_at' => '1 day ago'
			                ],
			                'path' => $user2->path
			            ],
			            [
			                'data' =>[],
			                'links' => [
			                    'self' => '/posts'
			                ]
			            ]
			        ]);
			    }

			    /** @test */
			    public function inverse_friendships_can_be_fetched_in_the_profile()
			    {
			        $this->withoutExceptionHandling();

			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        //Another way without post response
			        $friendRequest = Friend::create([
			            'friend_id' => $user1->id,
			            'user_id' => $user2->id,
			            'confirmed_at' => now()->subDay(),
			            'status' => 1
			        ]);

			        $response = $this->get('/api/users/' . $user2->id);

			        $response->assertStatus(200);

			        $response->assertJson([
			            [
			                'id' => $user2->id,
			                'name' => $user2->name,
			                'email' => $user2->email,
			                'friendship' => [
			                    'confirmed_at' => '1 day ago'
			                ],
			                'path' => $user2->path
			            ],
			            [
			                'data' =>[],
			                'links' => [
			                    'self' => '/posts'
			                ]
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_delete_friend_request()
			    {
			        $this->withoutExceptionHandling();

			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $response1 = $this->post('/api/send-request', ['friend_id' => $user2->id]);

			        $this->actingAs($user2, 'api'); //It just logs in the user

			        $response2 = $this->post('/api/delete-request', ['user_id' => $user1->id]);

			        $response2->assertStatus(204);

			        $friendRequest = Friend::first(); //To grab first row from the friend's table

			        $this->assertNull($friendRequest);

			        $response2->assertNoContent();
			    }

			    /** @test */
			    public function third_party_user_cannot_delete_the_request()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $response1 = $this->post('/api/send-request', ['friend_id' => $user2->id]);

			        $response1->assertStatus(200);

			        $user3 = factory(User::class)->create();

			        $this->actingAs($user3, 'api');

			        $response2 = $this->post('/api/delete-request', ['user_id' => $user1->id]);

			        $response2->assertStatus(404);

			        $friendRequest = Friend::first();

			        $this->assertEquals(null, $friendRequest->confirmed_at);

			        $this->assertEquals(null, $friendRequest->status);

			        $response2->assertJson([
			            'errors' => [
			                'code' => 404,
			                'title' => 'Friend Request not found',
			                'detail' => 'Unable to locate friend request with given information'
			            ]
			        ]);
			    }

			    /** @test */
			    public function user_id_is_required_to_delete_request()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->post('/api/delete-request', ['user_id' => '']);

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey('user_id', $responseString['errors']['meta']);
			    }

			    /** @test */
			    public function auth_user_can_send_friend_request_only_once()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $this->post('/api/send-request', ['friend_id' => $user2->id])->assertStatus(200);

			        $this->post('/api/send-request', ['friend_id' => $user2->id])->assertStatus(200);

			        $friendRequest = Friend::all(); //To grab first row from the friend's table

			        $this->assertCount(1, $friendRequest);
			    }

			    /** @test */
			    public function auth_user_can_edit_his_profile()
			    {
			        $this->withExceptionHandling();

			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $response = $this->put('/api/users/' . $user->id, ['gender' => 'female', 'city' => 'New City', 'about' => 'Edited info about me']);

			        $response->assertStatus(201);

			        //AuthController->Me() does not contain data[] but UserController->update() contains. Check both controller to understand the difference.
			        $response->assertJson([
			            'data' => [
			                'id' => $user->id,
			                'name' => $user->name,
			                'email' => $user->email,
			                'city' => 'New City',
			                'gender' => 'female',
			                'birthday' => [
			                    'when' => $user->birthday->format('d') - Carbon::now()->format('d'),
			                    'age' => Carbon::now()->format('Y') - $user->birthday->format('Y'),
			                    'day_name' => $user->birthday->format('l'),
			                    'day' => $user->birthday->day,
			                    'month' => $user->birthday->month,
			                    'year' => $user->birthday->year,
			                ],
			                'interest' => $user->interest,
			                'about' => 'Edited info about me',

			                'friendship' => [],

			                //This is default settings when no cover pic is uploaded
			                'cover_image' => [
			                    'path' => 'uploadedAvatars/cover.jpg',
			                    'width' => 1500,
			                    'height' => 500,
			                    'type' => 'cover',
			                ],

			                //This is default settings when no profile pic is uploaded
			                'profile_image' => [
			                    'path' => 'uploadedAvatars/profile.jpg',
			                    'width' => 750,
			                    'height' => 750,
			                    'type' => 'profile',
			                ],

			                'path' => $user->path
			            ]
			        ]);
			    }
			}


	[5.6] Testing for items, images and bookmarks
		php artisan make:test ItemTest

		#tests->Feature->ItemTest
			<?php

			namespace Tests\Feature;

			use App\Category;
			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Http\UploadedFile;
			use Illuminate\Support\Facades\Storage;
			use Tests\TestCase;

			use App\Item;
			use App\Image;
			use App\User;


			class ItemTest extends TestCase
			{
			    use RefreshDatabase;

			    protected $user;
			    protected $category;
			    protected $item;
			    protected $image;
			    protected $file;

			    //As we accept only items with images, in order to have a base item for delete, update and bookmark, we need to write whole test code of creating and storing the item with image. Therefore, using setUp() makes the code look cleaner.
			    protected function setUp(): void
			    {
			        parent::setUp();

			        $this->actingAs($this->user = factory(User::class)->create(), 'api');

			        $this->category = factory(Category::class)->create();

			        $this->file = UploadedFile::fake()->image('itemImage.jpg');

			        $response = $this->post('/api/upload-images', [
			            'title' => 'A new item',
			            'description' => 'Dropzone image is required',
			            'price' => 60,
			            'image' => [$this->file],
			            'category_id' => $this->category->id,
			            'user_id' => $this->user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedImages/' . $this->file->hashName());

			        $this->assertCount(1, Item::all());
			        $this->assertCount(1, Image::all());

			        $this->item = Item::first();
			        $this->image = Image::first();
			    }

			    /** @test */
			    //actingAs is another way to login if you don't want pass the token
			    public function auth_user_can_fetch_all_items()
			    {
			        factory(Item::class)->create(['user_id' => $this->user->id, 'category_id' => $this->category->id]);

			        $items = Item::all();
			        $item1 = $items[0];
			        $item2 = $items[1];

			        $response = $this->get('/api/items');

			        //Unlike PostTest, we cannot use $posts->first() and $posts->last() because first and last are for factory and in PostTest we created both posts using factory. Here we are creating 1 post using factory and one is from the setup.
			        $response->assertJson([
			            'data' => [
			                [
			                    'id' => $item1->id,
			                    'title' => $item1->title,
			                    'description' => $item1->description,
			                    'price' => $item1->price,
			                    'category_id' => $item1->category_id,
			                    'user_id' => $item1->user_id,
			                    'created_at' => now()->diffForHumans(),

			                    //'replies' => [],

			                    'bookmarks' => [],

			                    'images' => [],

			                    'category' => [
			                        'id' => $this->category->id,
			                        'name' => $this->category->name,
			                        'created_at' => $this->category->created_at->diffForHumans()
			                    ],

			                    'posted_by' => [
			                        'id' => $this->user->id,
			                        'name' => $this->user->name,
			                        'email' => $this->user->email,
			                    ],

			                    'path' => '/items',
			                ],
			                [
			                    'id' => $item2->id,
			                    'title' => $item2->title,
			                    'description' => $item2->description,
			                    'price' => $item2->price,
			                    'category_id' => $item2->category_id,
			                    'user_id' => $item2->user_id,
			                    'created_at' => now()->diffForHumans(),

			                    //'replies' => [],

			                    'bookmarks' => [],

			                    'images' => [],

			                    'category' => [
			                        'id' => $this->category->id,
			                        'name' => $this->category->name,
			                        'created_at' => $this->category->created_at->diffForHumans()
			                    ],

			                    'posted_by' => [
			                        'id' => $this->user->id,
			                        'name' => $this->user->name,
			                        'email' => $this->user->email,
			                    ],

			                    'path' => '/items',
			                ],
			            ],
			            'item_count' => 2,
			            'links' => [
			                'self' => '/posts'
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_create_item_with_images()
			    {
			        $file1 = UploadedFile::fake()->image('itemImage1.jpg');
			        $file2 = UploadedFile::fake()->image('itemImage2.jpg');
			        $file3 = UploadedFile::fake()->image('itemImage3.jpg');

			        $response = $this->post('/api/upload-images', [
			            'title' => 'A new item',
			            'description' => 'Dropzone images are required',
			            'price' => 60,
			            'image' => [$file1, $file2, $file3],
			            'category_id' => $this->category->id,
			            'user_id' => $this->user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedImages/' . $file1->hashName());
			        Storage::disk('public')->assertExists('uploadedImages/' . $file2->hashName());
			        Storage::disk('public')->assertExists('uploadedImages/' . $file3->hashName());

			        $this->assertCount(2, Item::all());
			        $this->assertCount(4, Image::all());

			        $items = Item::all();
			        $item = $items[1];

			        $images = Image::all();
			        $image1 = $images[1];
			        $image2 = $images[2];
			        $image3 = $images[3];

			        $response->assertJson([
			            'data' => [
			                'id' => $item->id,
			                'title' => $item->title,
			                'description' => $item->description,
			                'price' => $item->price,
			                'category_id' => $item->category_id,
			                'user_id' => $item->user_id,
			                'created_at' => now()->diffForHumans(),

			                //'replies' => [],

			                'bookmarks' => [],

			                'images' => [
			                    'data' => [
			                        [
			                            'id' => $image1->id,
			                            'path' => $image1->path
			                        ],
			                        [
			                            'id' => $image2->id,
			                            'path' => $image2->path
			                        ],
			                        [
			                            'id' => $image3->id,
			                            'path' => $image3->path
			                        ]
			                    ],
			                    'image_count' => 3,
			                    'links' => [
			                        'self' => '/images',
			                    ]
			                ],

			                'category' => [
			                    'id' => $this->category->id,
			                    'name' => $this->category->name,
			                    'created_at' => $this->category->created_at->diffForHumans()
			                ],

			                'posted_by' => [
			                    'id' => $this->user->id,
			                    'name' => $this->user->name,
			                    'email' => $this->user->email,
			                ],

			                'path' => '/items',
			            ]
			        ]);
			    }

			    /** @test */
			    /*public function auth_user_can_update_item_images()
			    {

			    }*/

			    /** @test */
			    public function auth_user_can_update_item_details()
			    {
			        $response = $this->put('/api/items/' . $this->item->id, [
			            'title' => 'An updated title',
			            'description' => 'This is updated description'
			        ]);

			        $response->assertStatus(201);

			        $this->assertCount(1, Item::all());
			        $this->assertCount(1, Image::all());

			        $response->assertJson([
			            'data' => [
			                'id' => $this->item->id,
			                'title' => 'An updated title',
			                'description' => 'This is updated description',
			                'price' => $this->item->price,
			                'category_id' => $this->item->category_id,
			                'user_id' => $this->item->user_id,
			                'created_at' => now()->diffForHumans(),

			                //'replies' => [],

			                'bookmarks' => [],

			                'images' => [
			                    'data' => [
			                        [
			                            'id' => $this->image->id,
			                            'path' => $this->image->path
			                        ]
			                    ],
			                    'image_count' => 1,
			                    'links' => [
			                        'self' => '/images',
			                    ]
			                ],

			                'category' => [
			                    'id' => $this->category->id,
			                    'name' => $this->category->name,
			                    'created_at' => $this->category->created_at->diffForHumans()
			                ],

			                'posted_by' => [
			                    'id' => $this->user->id,
			                    'name' => $this->user->name,
			                    'email' => $this->user->email,
			                ],

			                'path' => '/items',
			            ]
			        ]);
			    }

			    /** @test */
			    //We have to create Item this way because we can not create simple text Item. Dropzone Image is required.
			    public function auth_user_can_delete_item()
			    {
			        $response = $this->delete('/api/items/' . $this->item->id);

			        $response->assertStatus(204);

			        $this->assertCount(0, Item::all());
			        $this->assertCount(0, Image::all());
			    }

			    /** @test */
			    public function auth_user_can_bookmark_an_item()
			    {
			        $response = $this->post('/api/items/' . $this->item->id . '/bookmark-unbookmark');

			        $response->assertStatus(200);

			        $this->assertCount(1, $this->user->bookmarks);

			        $response->assertJson([
			            'data' => [
			                [
			                    'created_at' => now()->diffForHumans(),
			                    'item_id' => $this->item->id,
			                    'user_id' => $this->user->id,
			                    'path' => '/items/' . $this->item->id,
			                ]
			            ],
			            'bookmark_count' => 1,
			            'user_bookmarked' => true,
			            'links' => [
			                'self' => '/items',
			            ],
			        ]);
			    }

			    /** @test */
			    public function items_are_returned_with_bookmarks()
			    {
			        $response = $this->post('/api/items/' . $this->item->id . '/bookmark-unbookmark');

			        $response->assertStatus(200);

			        $this->assertCount(1, $this->user->bookmarks);

			        $response = $this->get('/api/items');

			        $response->assertStatus(200);

			        $response->assertJson([
			            'data' => [
			                [
			                    'id' => $this->item->id,
			                    'title' => $this->item->title,
			                    'description' => $this->item->description,
			                    'price' => $this->item->price,
			                    'category_id' => $this->item->category_id,
			                    'user_id' => $this->item->user_id,
			                    'created_at' => now()->diffForHumans(),

			                    //'replies' => [],

			                    'bookmarks' => [
			                        'data' => [
			                            [
			                                'created_at' => now()->diffForHumans(),
			                                'item_id' => $this->item->id,
			                                'user_id' => $this->user->id,
			                                'path' => '/items/' . $this->item->id,
			                            ]
			                        ],
			                        'bookmark_count' => 1,
			                        'user_bookmarked' => true,
			                        'links' => [
			                            'self' => '/items',
			                        ],
			                    ],

			                    'images' => [
			                        'data' => [
			                            [
			                                'id' => $this->image->id,
			                                'path' => $this->image->path
			                            ],
			                        ],
			                        'image_count' => 1,
			                        'links' => [
			                            'self' => '/images',
			                        ]
			                    ],

			                    'category' => [
			                        'id' => $this->category->id,
			                        'name' => $this->category->name,
			                        'created_at' => $this->category->created_at->diffForHumans()
			                    ],

			                    'posted_by' => [
			                        'id' => $this->user->id,
			                        'name' => $this->user->name,
			                        'email' => $this->user->email,
			                    ],

			                    'path' => '/items'
			                ]
			            ],
			            'item_count' => 1,
			            'links' => [
			                'self' => '/posts'
			            ]
			        ]);
			    }

			    /** @test */
			    /*public function auth_user_can_share_item()
			    {

			    }*/

			    /** @test */
			    public function auth_user_cannot_create_item_without_images()
			    {
			        $response = $this->post('/api/upload-images', [
			            'title' => 'A new item',
			            'description' => 'Dropzone images are required',
			            'price' => 60,
			            'category_id' => $this->category->id,
			            'user_id' => $this->user->id
			        ]);

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertCount(1, Item::all());
			        $this->assertCount(1, Image::all());

			        $this->assertArrayHasKey('image', $responseString['errors']['meta']);
			    }

			    /** @test */
			    public function item_details_required_for_an_item_with_Images()
			    {
			        $response = $this->post('/api/upload-images', [
			            'image' => [$this->file],
			            'category_id' => $this->category->id,
			            'user_id' => $this->user->id
			        ]);

			        $response->assertStatus(422);

			        $this->assertCount(1, Item::all());
			        $this->assertCount(1, Image::all());

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey(
			            'title', $responseString['errors']['meta'],
			            'description', $responseString['errors']['meta'],
			            'price', $responseString['errors']['meta'],
			        );
			    }
			}

	[5.7] Testing for birthdays, tags and notifications
		php artisan make:test FeatureTest

		#tests->Feature->FeatureTest
			<?php

			namespace Tests\Feature;

			use App\Comment;
			use App\Http\Resources\Notification;
			use App\Post;
			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Illuminate\Support\Facades\Artisan;
			use Tests\TestCase;
			use Carbon\Carbon;
			use Faker\Generator as Faker;


			use App\User;


			class FeatureTest extends TestCase
			{
			    use RefreshDatabase;

			    //It will give error in JSon if endOfMonth and tomorrow in the same week
			    /** @test */
			    public function all_birthdays_can_be_filtered()
			    {
			        $user1 = factory(User::class)->create(['birthday' => Carbon::today()]);
			        $user2 = factory(User::class)->create(['birthday' => Carbon::tomorrow()]);
			        $user3 = factory(User::class)->create(['birthday' => Carbon::now()->endOfMonth()]);

			        $this->assertCount(3, User::all());

			        $this->actingAs($user3, 'api'); //Randomly login with any user

			        $response = $this->post('/api/filter-birthdays')->assertStatus(200);

			        $response->assertJson([
			            'today' => [
			                [
			                    'id' => $user1->id,
			                    'name' => $user1->name,
			                    'email' => $user1->email,
			                    'city' => $user1->city,
			                    'gender' => $user1->gender,
			                    'birthday' => [
			                        'when' => $user1->birthday->format('d') - Carbon::now()->format('d'),
			                        'age' => Carbon::now()->format('Y') - $user1->birthday->format('Y'),
			                        'day_name' => $user1->birthday->format('l'),
			                        'day' => $user1->birthday->day,
			                        'month' => $user1->birthday->month,
			                        'year' => $user1->birthday->year,
			                    ],
			                    'interest' => $user1->interest,
			                    'about' => $user1->about,

			                    'friendship' => null,

			                    'cover_image' => [
			                        'path' => 'uploadedAvatars/cover.jpg',
			                        'width' => 1500,
			                        'height' => 500,
			                        'type' => 'cover',
			                    ],

			                    'profile_image' => [
			                        'path' => 'uploadedAvatars/profile.jpg',
			                        'width' => 750,
			                        'height' => 750,
			                        'type' => 'profile',
			                    ],

			                    'path' => $user1->path
			                ],
			            ],
			            'week' => [
			                [
			                    'id' => $user2->id,
			                    'name' => $user2->name,
			                    'email' => $user2->email,
			                    'city' => $user2->city,
			                    'gender' => $user2->gender,
			                    'birthday' => [
			                        'when' => $user2->birthday->format('d') - Carbon::now()->format('d'),
			                        'age' => Carbon::now()->format('Y') - $user2->birthday->format('Y'),
			                        'day_name' => $user2->birthday->format('l'),
			                        'day' => $user2->birthday->day,
			                        'month' => $user2->birthday->month,
			                        'year' => $user2->birthday->year,
			                    ],
			                    'interest' => $user2->interest,
			                    'about' => $user2->about,

			                    'friendship' => null,

			                    'cover_image' => [
			                        'path' => 'uploadedAvatars/cover.jpg',
			                        'width' => 1500,
			                        'height' => 500,
			                        'type' => 'cover',
			                    ],

			                    'profile_image' => [
			                        'path' => 'uploadedAvatars/profile.jpg',
			                        'width' => 750,
			                        'height' => 750,
			                        'type' => 'profile',
			                    ],

			                    'path' => $user2->path
			                ]
			            ],
			            'month' => [
			                [
			                    'id' => $user3->id,
			                    'name' => $user3->name,
			                    'email' => $user3->email,
			                    'city' => $user3->city,
			                    'gender' => $user3->gender,
			                    'birthday' => [
			                        'when' => $user3->birthday->format('d') - Carbon::now()->format('d'),
			                        'age' => Carbon::now()->format('Y') - $user3->birthday->format('Y'),
			                        'day_name' => $user3->birthday->format('l'),
			                        'day' => $user3->birthday->day,
			                        'month' => $user3->birthday->month,
			                        'year' => $user3->birthday->year,
			                    ],
			                    'interest' => $user3->interest,
			                    'about' => $user3->about,

			                    'friendship' => null,

			                    'cover_image' => [
			                        'path' => 'uploadedAvatars/cover.jpg',
			                        'width' => 1500,
			                        'height' => 500,
			                        'type' => 'cover',
			                    ],

			                    'profile_image' => [
			                        'path' => 'uploadedAvatars/profile.jpg',
			                        'width' => 750,
			                        'height' => 750,
			                        'type' => 'profile',
			                    ],

			                    'path' => $user3->path
			                ]
			            ],
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_tag_a_friend_in_comment()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user
			        $user2 = factory(User::class)->create(['name' => 'jay']);

			        $post = factory(Post::class)->create(['id' => 123]);

			        $response = $this->post('/api/posts/' . $post->id . '/comments', ['body' => '@jay, hello how are you mate?']);

			        $response->assertStatus(200);

			        $comment = Comment::first();

			        $this->assertCount(1, Comment::all());

			        $this->assertEquals($user1->id, $comment->user_id);
			        $this->assertEquals($post->id, $comment->post_id);

			        $response->assertJson([
			            'data' => [
			                [
			                    'body' => '@jay, hello how are you mate?',
			                    'post_id' => $post->id,
			                    'updated_at' => now()->diffForHumans(),
			                    'commented_by' => [
			                        'name' => $user1->name,
			                        'email' => $user1->email
			                    ],

			                    'favourites' => [],
			                    'user_favourited' => false,
			                    'favourited_type' => [],

			                    'tag' => [
			                        'newBody' => ['@', ', hello how are you mate?'],
			                        'taggedUserID'=> $user2->id,
			                        'taggedUserName'=> $user2->name,
			                    ],

			                    'path' => '/posts/' . $post->id . '/comments/' . $comment->id,
			                ]
			            ],
			            'comment_count' => 1,
			            'links' => [
			                'self' => '/posts',
			            ],
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_post_on_friends_wall()
			    {
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //Randomly login with any user
			        $user2 = factory(User::class)->create();

			        $this->assertCount(2, User::all());

			        $response = $this->post('/api/wish-birthday', ['body' => 'Hey mate', 'friend_id' => $user2->id])->assertStatus(201);

			        $post = Post::first();

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => 'Hey mate',
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [],

			                'likes' => [],

			                'pictures' => [],

			                'shared_post' => null,
			                'shared_count' => 0,

			                'posted_on' => [
			                    'id' => $user2->id,
			                    'name' => $user2->name,
			                    'email' => $user2->email,
			                ],

			                'posted_by' => [
			                    'id' => $user1->id,
			                    'name' => $user1->name,
			                    'email' => $user1->email,
			                ],

			                'path' => $post->path
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_fetch_read_and_unread_notifications()
			    {
			        $this->withExceptionHandling();
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //Randomly login with any user
			        $user2 = factory(User::class)->create(['name' => 'jay']);

			        //Post on friend's wall
			        $this->post('/api/wish-birthday', ['body' => 'Hey mate', 'friend_id' => $user2->id])->assertStatus(201);

			        $post1 = Post::first();
			        $post2 = factory(Post::class)->create(['user_id' => $user2->id]);

			        //Like that Post
			        $this->post('/api/posts/' . $post2->id . '/like-dislike')->assertStatus(200);

			        //Comment on that post
			        $this->post('/api/posts/' . $post2->id . '/comments', ['body' => 'hello how are you mate?'])->assertStatus(200);

			        //Share a Post
			        $this->post('/api/share-post', [
			            'body' => 'A new body for shared post',
			            'repost_id' => $post2->id,
			            'user_id' => $user1->id
			        ]);

			        //Fetch all notifications
			        $this->actingAs($user2, 'api');

			        $response = $this->post('/api/notifications')->assertStatus(200);
			        $response2 = $response->decodeResponseJson();

			        $this->assertCount(4, $response2['all']);
			        $this->assertCount(0, $response2['read']);
			        $this->assertCount(4, $response2['unread']);
			    }
			}



6) Setup frontend
	[6.1] Install frontend frameworks
		#Vue, vue-router, vuex
			composer require laravel/ui

			php artisan ui vue --auth

			npm install vue-router

			npm install && npm run dev

			npm install vuex --save-dev

			npm install dropzone

		#Tailwind
			composer require laravel-frontend-presets/tailwindcss --dev

			php artisan ui tailwindcss

			npm install && npm run dev

			#tailwind.config.js //It will be added by default
				mmodule.exports = {
				    purge: [
				        './resources/views/**/*.blade.php',
				        './resources/css/**/*.css',
				    ],
				    theme: {
				        extend: {
				            width: {
				                '35': '8.7rem',
				                '72': '18rem',
				                '80': '20rem',
				                '96': '24rem'
				            },
				            height: {
				                '35': '8.7rem',
				                '72': '20rem',
				                '80': '24rem',
				            },
				            fontSize: {
				                '11xl': '8.5rem',
				            },
				            margin: {
				                '36': '9rem',
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

				Auth::routes();

				Route::get('{any}', 'HomeController@index')->where('any', '.*'); //Does the same thing as Route::view('home') in BlogSPA. This is just much easier than writing 3 lines. Visitn BlogSPA for more details.

			#app->Http->Controllers->HomeController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;

				class HomeController extends Controller
				{
				    public function __construct()
				    {
				        //Use middleware('auth') for default laravel authentication.
				        $this->middleware('api');
				    }

				    public function index()
				    {
				        return view('home');
				    }
				}

			#resources->views->layouts->app.blade.php
				//Remove <nav></nav> component from body. Keep head as it is
				<head>
					...
				</head>

    			<body class="bg-gray-200 text-gray-800 antialiased font-sans">
			        <div id="app">
			            <main class="h-screen">
			                @yield('content')
			            </main>
			        </div>
			    </body>

			#resources->views->home.blade.php
				@extends('layouts.app')

				@section('content')
				    <App/>
				@endsection

			#app->provider->RouteServiceProvider
				...
				public const HOME = '/'; //Once user login or registers, it redirects him to /home by default. We need to change that to '/'

	[6.3] Modify the frontend enviornment
		#Create an App component
			#resources->js->components->App.vue
				<template>
				    <div class="bg-red-500">
				        <h1>Hello</h1>
				    </div>
				</template/>

				<script>
				    export default {
				        name: "App",
				    }
				</script/>

		#Make it the main component in app.js
			#resources->js->app.js
				import Vue from 'vue';
				import router from './router';
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

			#Create a new router.js file
				#resources->js->router.js
					import Vue from 'vue';
					import VueRouter from 'vue-router';
					import ExampleComponent from './components/ExampleComponent'

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
	[7.1] Basic JavaScript setup (app, router, bootstrap)
		#resources->js->app.js
			import Vue from 'vue';
			import router from './router';
			import App from './components/App';
			import store from './store';
			import User from './store/helpers/user.js';

			import '@fortawesome/fontawesome-free/css/all.css'
			import '@fortawesome/fontawesome-free/js/all.js'

			window.User = User
			window.EventBus = new Vue();
			window.Vue = require('vue');

			console.log(User.id());

			require('./bootstrap');

			const app = new Vue({
			    el: '#app',
			    components: {
			        App
			    },
			    router,
			    store
			});

		#resources->js->router.js
			import Vue from 'vue';
			import VueRouter from 'vue-router';

			import User from './store/helpers/user'
			import NewsFeed from "./components/Main/NewsFeed";
			import ShowUser from "./components/User/ShowUser";
			import EditUser from "./components/User/EditUser";
			import ShowItems from "./components/Item/ShowItems";
			import ShowItem from "./components/Item/ShowItem";
			import ShowBirthdays from "./components/Feature/ShowBirthdays";

			let homeTitle = 'Sign Up';

			if(User.loggedIn()) {
			    homeTitle = 'NewsFeed'
			}

			Vue.use(VueRouter);

			export default new VueRouter({
			    routes: [
			        { path: '/', component: NewsFeed, meta:{title: homeTitle} },

			        { path: '/users/:userId', component: ShowUser, meta:{title: 'Profile'} },
			        { path: '/edituser', component: EditUser, meta:{title: 'Update Profile'} },

			        { path: '/items', component: ShowItems, meta:{title: 'Marketplace'} },
			        { path: '/items/:itemId', component: ShowItem, meta:{title: 'Marketplace'} },

			        { path: '/category1items', component: ShowItems, meta:{title: 'Categories'} },
			        { path: '/category2items', component: ShowItems, meta:{title: 'Categories'} },
			        { path: '/category3items', component: ShowItems, meta:{title: 'Categories'} },
			        { path: '/category4items', component: ShowItems, meta:{title: 'Categories'} },
			        { path: '/category5items', component: ShowItems, meta:{title: 'Categories'} },

			        { path: '/birthdays', component: ShowBirthdays, meta:{title: 'Birthday'} },
			    ],
			    mode: 'history',
			    hash: false
			});

		#resources->js->bootstrap.js
			window._ = require('lodash');

			window.axios = require('axios');

			window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

			const OAuthToken = `Bearer ${localStorage.getItem('token')}`

			window.axios.defaults.headers.common['Authorization'] = OAuthToken;


	[7.2] Store JavaScript setup (index, modules, helpers)
		#resources->js->store->index.js
			import Vue from 'vue';
			import Vuex from 'vuex';
			import Auth from './modules/auth.js'
			import Title from './modules/title.js'
			import Request from './modules/request.js'
			import Posts from './modules/posts.js'
			import Comments from './modules/comments.js'
			import Items from './modules/items.js'
			import Categories from './modules/categories.js'
			import User from './modules/user.js'
			import Features from './modules/features.js'
			import Notifications from './modules/notifications.js'
			import Search from './modules/search.js'

			Vue.use(Vuex);

			export default new Vuex.Store({
			    modules: {
			        Auth,
			        Title,
			        Request,
			        Posts,
			        Comments,
			        Items,
			        Categories,
			        User,
			        Features,
			        Notifications,
			        Search
			    }
			});


		[7.2.1] Setup modules 
			#resources->js->store->modules->auth.js
				import User from '../helpers/user'

				const state = {
				    authUser: '',
				    authUserStatus: '',
				    authErrors: ''
				};

				const getters = {
				    authUser: state => {
				        return state.authUser;
				    },

				    authUserStatus: state => {
				        return state.authUserStatus;
				    },

				    authErrors: state => {
				        return state.authErrors;
				    }
				};

				const actions = {
				    loginUser({commit, state}, loginForm) {
				        axios.post('/api/login', loginForm)
				            .then(res => commit('setLoginResponse', res))
				            .catch(err => commit('setAuthErrors', err))
				    },

				    registerUser({commit, state}, registerForm) {
				        axios.post('/api/register', registerForm)
				            .then(res => commit('setLoginResponse', res))
				            .catch(err => commit('setAuthErrors', err))
				    },

				    fetchAuthUser({commit, state}) {
				        axios.post('/api/me')
				            .then(res => commit('setAuthUser', res.data))
				            .catch(err => commit('setAuthErrors', err))
				    },

				    logoutAuthUser({commit, state}) {
				        axios.post('/api/logout')
				            .then(res => {
				                commit('setLogoutResponse')
				                commit('setAuthUser', null)
				            })
				            .catch(err => commit('setAuthErrors', err))
				    }
				};

				const mutations = {
				    setLoginResponse(state, res) {
				        User.responseAfterLogin(res)
				    },

				    setAuthUser(state, user) {
				        state.authUser = user;
				    },

				    setLogoutResponse(state) {
				        User.logout()
				    },

				    setAuthErrors(state, err) {
				        state.authErrors = err.response.data.errors;
				    },
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->title.js
				const state = {
				    title: 'Welcome',
				};

				const getters = {
				    title: state => {
				        return state.title;
				    }
				};

				const actions = {
				    getPageTitle({commit}, title) {
				        commit('setTitle', title);
				    }
				};

				const mutations = {
				    setTitle(state, title) {
				        state.title = title + ' | Facebook';

				        document.title = state.title;
				    }
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->request.js
				const state = {
				    user: '',
				    userStatus: null,
				    userErrors: ''
				};

				const getters = {
				    user: state => {
				        return state.user;
				    },

				    friendship: state => { //Just an alias. Not mandatory.
				        return state.user.friendship;
				    },

				    friendButton: (state, getters, rootState)=> {
				        if(rootState.Auth.authUser.id == state.user.id) {
				            return;
				        } else if (getters.friendship == null) {
				            return 'Add Friend';
				        } else if (getters.friendship.confirmed_at == null
				            && getters.friendship.friend_id !== rootState.Auth.authUser.id) {
				            return 'Pending Request';
				        } else if (getters.friendship.confirmed_at !== null)
				            return '';

				        return 'Accept'
				    },

				    userErrors: state => {
				        return state.userErrors;
				    },

				    status: state => {
				        return {
				            user: state.userStatus,
				        };
				    },
				};

				const actions = {
				    fetchUser({commit, state}, id) {
				        axios.get('/api/users/' + id)
				            .then(res => {
				                commit('setUser', res.data[0])
				                commit('setStatus', 'loading')
				            })
				            .catch(err => commit('setUserErrors', err))
				    },

				    sendRequest({commit, state}, id) {
				        axios.post('/api/send-request', {'friend_id': id})
				            .then(res => commit('setUserFriendship', res.data))
				            .catch(err => commit('setUserErrors', err))
				    },

				    acceptRequest({commit, state}, id) {
				        axios.post('/api/confirm-request', {'user_id': id})
				            .then(res => commit('setUserFriendship', res.data.data))
				            .catch(err => commit('setUserErrors', err))
				    },

				    deleteRequest({commit, state}, id) {
				        axios.post('/api/delete-request', {'user_id': id})
				            .then(res => commit('setUserFriendship', null))
				            .catch(err => commit('setUserErrors', err))
				    },
				};

				const mutations = {
				    setUser(state, user) {
				        state.user = user
				    },

				    setStatus(state, status) {
				        state.userStatus = status
				    },

				    setUserFriendship(state, friendship) {
				        state.user.friendship = friendship
				    },

				    setUserErrors(state, err) {
				        state.userErrors = err.response;
				    },
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->posts.js
				const state = {
				    posts: '',
				    postStatus: '',
				    postErrors: null,
				    body: '',
				};

				const getters = {
				    posts: state => {
				        return state.posts;
				    },

				    postStatus: state => {
				        return state.postStatus;
				    },

				    postErrors: state => {
				        return state.postErrors;
				    },

				    body: state => {
				        return state.body;
				    }
				};

				const actions = {
				    fetchAllPosts({commit, state}) {
				        commit('setPostStatus', 'loading')

				        axios.get('api/posts')
				            .then(res => {
				                commit('setPosts', res.data.data)
				                commit('setPostStatus', 'success')
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    fetchUserPosts({commit, state}, id) {
				        axios.get('/api/users/' + id)
				            .then(res => {
				                commit('setPosts', res.data[1].data)
				                commit('setPostStatus', 'success')
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    createPost({commit, state}) {
				        axios.post('/api/posts', {body: state.body})
				            .then(res => {
				                commit('pushPost', res.data)
				                commit('setPostBody', '')
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    updatePost({commit, state}, post) {
				        axios.put('/api/posts/' + post.id, {body: post.body})
				            .then(res => {
				                commit('pushPost', res.data)
				                commit('setPostBody', '')
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    deletePost({commit, state}, data) {
				        axios.delete('/api/posts/' + data.post_id)
				            .then(res => {
				                commit('splicePost', data)
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    likeDislikePost({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/like-dislike')
				            .then(res => commit('pushLikes', {likes: res.data, index: data.index}))
				            .catch(err => commit('setPostErrors', err))
				    },

				    sharePost({commit, state}, data) {
				        axios.post('/api/share-post', {body: data.body, repost_id: data.repost_id})
				            .then(res => commit('pushSharedPost', {newPost: res.data, repost_index: data.repost_index}))
				            .catch(err => commit('setPostErrors', err))
				    },
				};

				const mutations = {
				    setPosts(state, posts) {
				        state.posts = posts
				    },

				    setPostStatus(state, status) {
				        state.postStatus = status
				    },

				    setPostErrors(state, err) {
				        state.postErrors = err.response
				    },

				    setPostBody(state, body) {
				        state.body = body
				    },

				    pushPost(state, newPost) {
				        state.posts.unshift(newPost.data)
				    },

				    splicePost(state, data) {
				        state.posts.splice(data.index, 1)
				    },

				    cancelEdit(state, post) {
				        state.posts.unshift(post)
				    },

				    pushLikes(state, data) {
				        state.posts[data.index].likes = data.likes
				    },

				    pushSharedPost(state, data) {
				        state.posts.unshift(data.newPost.data)
				        state.posts[data.repost_index + 1].shared_count++ //+1 because the index of all posts will change once a new post is added
				    },
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->comments.js
				import Posts from './posts'

				const state = {
				    //Unlike posts, we will pass the body from the vue file as a parameter (Just to do it differently)
				    commentErrors: null
				};

				const getters = {
				    commentErrors: state => {
				        return state.commentErrors;
				    }
				};

				const actions = {
				    createComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments', {body: data.body})
				            .then(res => {
				                commit('pushComments', {comments: res.data, post_index: data.post_index})
				                var latest_comment = res.data.data
				                axios.post('/api/notify-tagged-user', {tagged_user_id: latest_comment[0].tag.taggedUserID, tagged_comment_id: latest_comment[0].id})
				            })
				            .catch(err => commit('setCommentErrors', err))
				    },

				    updateComment({commit, state}, data) {
				        axios.put('/api/posts/' + data.post_id + '/comments/' + data.comment_id, {body: data.comment_body})
				            .then(res => {
				                commit('pushComments', {comments: res.data, post_index: data.post_index})
				                var latest_comment = res.data.data
				                axios.post('/api/notify-tagged-user', {tagged_user_id: latest_comment[0].tag.taggedUserID, tagged_comment_id: latest_comment[0].id})
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    deleteComment({commit, state}, data) {
				        axios.delete('/api/posts/' + data.post_id + '/comments/' + data.comment_id)
				            .then(res => commit('spliceComment', data))
				            .catch(err => commit('setCommentErrors', err))
				    },

				    favouriteUnfavouriteComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments/' + data.comment_id + '/favourite-unfavourite', {type: data.type})
				            .then(res => commit('pushFavourites', {favourites: res.data, post_index: data.post_index, comment_index: data.comment_index}))
				            .catch(err => commit('setCommentErrors', err))
				    }
				};

				const mutations = {
				    setCommentErrors(state, err) {
				        state.commentErrors = err.response
				    },

				    pushComments(state, data) {
				        Posts.state.posts[data.post_index].comments = data.comments
				    },

				    // This is for the GifController. Just a different way. We are pushing the newly created gif comment.
				    pushComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.unshift(data.comment)
				    },

				    spliceComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.splice(data.comment_index, 1)
				    },

				    /*
				        Here we have to change user_favourited and favourited_type change manually as they are in CommentResource and not in the FavouriteCollection unlike Likes and Bookmarks.
				        If user_favourited was in FavouriteCollection, it would've been updated by default using ID as the id field would be user_id in FavouriteResource.
				        But it is only applicable in ManyToMany. As we are using HasMany, the $this->id in collection would refer to the id of favourite table's id which is useless.
				    */
				    pushFavourites(state, data) {
				        //We need to replace favourites Only for counts.
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].favourites = data.favourites
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].user_favourited = ! Posts.state.posts[data.post_index].comments.data[data.comment_index].user_favourited
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].favourited_type = data.favourites.data[0].type
				    }
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->categories.js
				const state = {
				    categories: '',
				    categoryErrors: null,
				};

				const getters = {
				    categories: state => {
				        return state.categories;
				    },

				    categoryErrors: state => {
				        return state.categoryErrors;
				    },
				};

				const actions = {
				    fetchAllCategories({commit, state}) {
				        axios.get('api/categories')
				            .then(res => {
				                commit('setCategories', res.data.data)
				            })
				            .catch(err => commit('setCategoryErrors', err))
				    },
				};

				const mutations = {
				    setCategories(state, categories) {
				        state.categories = categories
				    },

				    setCategoryErrors(state, err) {
				        state.categoryErrors = err.response
				    },
				};

				export default {
				    state, getters, actions, mutations
				}


			#resources->js->store->modules->items.js
				const state = {
				    item: '',
				    items: '',
				    itemStatus: '',
				    itemErrors: null,
				};

				const getters = {
				    item: state => {
				        return state.item;
				    },

				    items: state => {
				        return state.items;
				    },

				    itemStatus: state => {
				        return state.itemStatus;
				    },

				    itemErrors: state => {
				        return state.itemErrors;
				    }
				};

				const actions = {
				    fetchAllItems({commit, state}) {
				        commit('setItemStatus', 'loading')

				        axios.get('api/items')
				            .then(res => {
				                commit('setItems', res.data.data)
				                commit('setItemStatus', 'success')
				            })
				            .catch(err => commit('setItemErrors', err))
				    },

				    createItem({commit, state}, itemForm) {
				        axios.post('/api/items', itemForm)
				            .then(res => {
				                commit('pushItem', res.data)
				            })
				            .catch(err => commit('setItemErrors', err))
				    },

				    showItem({commit, state}, itemId) {
				        axios.get('/api/items/' + itemId)
				            .then(res => {
				                commit('setItem', res.data.data)
				                commit('setItemStatus', 'success')
				            })
				            .catch(err => commit('setItemErrors', err))
				    },

				    editItem({commit, state}, itemForm) {
				        axios.put('/api/items/' + itemForm.id, itemForm)
				            .then(res => {
				                commit('setItemStatus', 'success')
				            })
				            .catch(err => commit('setItemErrors', err))
				    },

				    deleteItem({commit, state}, itemId) {
				        axios.delete('/api/items/' + itemId)
				            .then(res => {
				                commit('setItemStatus', 'success')
				            })
				            .catch(err => commit('setItemErrors', err))
				    },

				    bookmarkUnbookmarkItem({commit, state}, data) {
				        axios.post('/api/items/' + data.item_id + '/bookmark-unbookmark')
				            .then(res => {
				                commit('pushBookmarks', {bookmarks: res.data, index: data.item_index})
				            })
				            .catch(err => commit('setItemErrors', err))
				    },
				};

				const mutations = {
				    setItems(state, items) {
				        state.items = items
				    },

				    setItem(state, item) {
				        state.item = item
				    },

				    pushItem(state, newItem) {
				        state.items.unshift(newItem.data)
				    },

				    pushBookmarks(state, data) {
				        state.items[data.index].bookmarks = data.bookmarks
				    },

				    setItemStatus(state, status) {
				        state.itemStatus = status
				    },

				    setItemErrors(state, err) {
				        state.itemErrors = err.response
				    }
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->user.js
				import router from "../../router";

				const state = {
				    users: '',
				};

				const getters = {
				    users: state => {
				        return state.users;
				    }
				};

				const actions = {
				    fetchAllUsers({commit, state}) {
				        axios.get('/api/users')
				            .then(res => commit('setUsers', res.data.data))
				    },

				    updateUser({commit, state}, user) {
				        axios.put('/api/users/' + user.id, {
				            name: user.name,
				            email: user.email,
				            city: user.city,
				            gender: user.gender,
				            birthday: user.birthday.day + '-' + user.birthday.month + '-' + user.birthday.year,
				            interest: user.interest,
				            about: user.about
				        })
				            .then(res => router.push('/'))
				            .catch(err => console.log(err))
				    },
				};

				const mutations = {
				    setUsers(state, data) {
				        state.user = data
				    },
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->notifications.js
				const state = {
				    notificationMode: false, //It's taken here rather than in the Vue to avoid the use of EventBus.
				    allNotifications: {},
				    readNotifications: {},
				    unreadNotifications: {},
				    notificationErrors: null
				};

				const getters = {
				    notificationMode: state => {
				        return state.notificationMode;
				    },

				    allNotifications: state => {
				        return state.allNotifications;
				    },

				    readNotifications: state => {
				        return state.readNotifications;
				    },

				    unreadNotifications: state => {
				        return state.unreadNotifications;
				    },

				    notificationErrors: state => {
				        return state.notificationErrors;
				    }
				};

				const actions = {
				    fetchAllNotifications({commit, state}) {
				        axios.post('/api/notifications')
				            .then(res => commit('setNotifications', res.data))
				            .catch(err => commit('setNotificationErrors', err))
				    },

				    markAsRead({commit, state}, notification) {
				        axios.post('/api/mark-as-read', {id: notification.id})
				            .then(res => commit('setMarkAsRead', notification))
				            .catch(err => commit('setBirthdayErrors', err))
				    },

				    hideFriendButtons({commit, state}, data) {
				        axios.post('/api/hide-friend-buttons', data)
				            .then(res => commit('setMarkAsRead', notification))
				            .catch(err => commit('setBirthdayErrors', err))
				    }
				};

				const mutations = {
				    setNotificationMode(state, newMode) {
				        state.notificationMode = newMode
				    },

				    setNotifications(state, notifications) {
				        state.allNotifications = notifications.all
				        state.readNotifications = notifications.read
				        state.unreadNotifications = notifications.unread
				    },

				    setMarkAsRead(state, notification) {
				        state.notificationMode = false
				        state.unreadNotifications.splice(notification, 1)
				        state.readNotifications.push(notification)
				    },

				    setNotificationErrors(state, err) {
				        state.notificationErrors = err
				    },
				};

				export default {
				    state, getters, actions, mutations
				}
			
			#resources->js->store->modules->features.js
				import Posts from './posts'

				const state = {
				    birthdays: '',
				    birthdayErrors: '',
				    avatars: ''
				};

				const getters = {
				    birthdays: state => {
				        return state.birthdays;
				    },

				    birthdayErrors: state => {
				        return state.birthdayErrors;
				    },

				    avatars: state => {
				        return state.avatars;
				    },
				};

				const actions = {
				    fetchAllBirthdays({commit, state}) {
				        axios.post('/api/filter-birthdays')
				            .then(res => commit('setBirthdays', res.data))
				            .catch(err => commit('setBirthdayErrors', err))
				    },

				    wishBirthday({commit, state}, data) {
				        axios.post('/api/wish-birthday', {body: data.body, friend_id: data.friend_id})
				            .then(res => {
				                commit('pushPost', res.data)
				                commit('setPostBody', '')
				            })
				            .catch(err => commit('setBirthdayErrors', err))
				    },

				    fetchAllAvatars({commit, state}, user_id) {
				        axios.post('/api/get-all-avatars', {user_id: user_id})
				            .then(res => commit('setAvatars', res.data))
				    },

				    setPostBody(state, body) {
				        Posts.state.body = body
				    },

				    pushPost(state, newPost) {
				        Posts.state.posts.unshift(newPost.data)
				    },
				};

				const mutations = {
				    setBirthdays(state, birthdays) {
				        state.birthdays = birthdays
				    },

				    setBirthdayErrors(state, err) {
				        state.birthdayErrors = err
				    },

				    setAvatars(state, avatars) {
				        state.avatars = avatars
				    }
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->search.js
				const state = {
				    searchResult: '',
				    searchErrors: null
				};

				const getters = {
				    searchResult: state => {
				        return state.searchResult;
				    },

				    searchErrors: state => {
				        return state.searchErrors;
				    }
				};

				const actions = {
				    fetchSearchResult({commit, state}, searchTerm) {
				        axios.post('/api/search', {searchTerm: searchTerm})
				            .then(res => commit('setSearchResult', res.data.data))
				            .catch(err => commit('setSearchErrors', err))
				    }
				};

				const mutations = {
				    setSearchResult(state, data) {
				        state.searchResult = data
				    },

				    setSearchErrors(state, err) {
				        state.searchErrors = err
				    },
				};

				export default {
				    state, getters, actions, mutations
				}


		[7.2.2] Setup helpers 
			#resources->js->store->helpers->user.js
				import Token from './token'
				import Storage from './storage'

				class User {
				    responseAfterLogin(res) {
				        const token = res.data.access_token
				        const username = res.data.name

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

			#resources->js->store->helpers->storage.js
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

			#resources->js->store->helpers->token.js
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

	[7.3] Components
		#resources->js->components->App.vue
			<template>
			    <div>
			        <div v-if="! loggedIn">
			            <div v-if="! registerMode"> <Login /> </div>

			            <div v-else> <Register /> </div>
			        </div>

			        <div v-else> <Home /> </div>
			    </div>
			</template>

			<script>
			    import Login from "./Auth/Login";
			    import Register from "./Auth/Register";
			    import Home from "./Main/Home";

			    export default {
			        name: "App",

			        components: {Login, Register, Home},

			        data() {
			            return {
			                loggedIn: User.loggedIn(),
			                registerMode: false
			            }
			        },

			        created() {
			            this.$store.dispatch('getPageTitle', this.$route.meta.title)

			            EventBus.$on('changingRegisterMode', () => {
			                this.registerMode = ! this.registerMode
			            })

			            if (this.$attrs.email) {
			                this.$store.dispatch('loginUser', {email: this.$attrs.email, password: 'password'})
			            }
			        },

			        watch: {
			            $route(to, from) {
			                this.$store.dispatch('getPageTitle', to.meta.title)
			            }
			        }
			    }
			</script>

			<style>

			</style>


		[7.3.1] Auth
			#resources->js->components->Auth->Login.vue
				<template>
				    <div class="flex h-screen items-center justify-center">
				        <div class="w-full max-w-xs">
				            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>

				                    <input v-model="loginForm.email" class="mb-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">

				                    <p v-if="authErrors && authErrors.meta.email" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>

				                    <input v-model="loginForm.password" class="mb-3 shadow appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">

				                    <p v-if="authErrors && authErrors.meta.password" class="text-red-500 text-xs italic">{{authErrors.meta.password[0]}}</p>
				                </div>

				                <p v-if="authErrors && authErrors.meta.unauthorised" class="mb-4 text-red-500 text-xs italic">{{authErrors.meta.unauthorised}}</p>

				                <div class="flex items-center justify-between mb-4">
				                    <button @click="dispatchLogin(loginForm)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none">Log In</button>

				                    <a @click="changeRegisterMode" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Click Here To Register!</a>
				                </div>

				                <div class="flex items-center justify-end text-xl">
				                    <a href="api/login/github" ><i class="fab fa-github mx-2"></i></a>
				                    <a href="api/login/google" ><i class="fab fa-google ml-2 text-green-600"></i></a>
				                </div>
				            </form>
				        </div>
				    </div>
				</template/>

				<script>
				    import { mapGetters } from 'vuex';

				    export default {
				        name: "Login",

				        props: ['title'],

				        data() {
				            return {
				                loginForm: {
				                    email: '',
				                    password: ''
				                }
				            }
				        },

				        computed: {
				            ...mapGetters({
				                authErrors: 'authErrors'
				            })
				        },

				        methods: {
				            dispatchLogin(loginForm) {
				                this.$store.dispatch('loginUser', loginForm)
				            },

				            changeRegisterMode() {
				                EventBus.$emit('changingRegisterMode')
				            },

				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Auth->Register.vue
				<template>
				    <div class="flex h-full items-center justify-center">
				        <div class="w-full max-w-xs">
				            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 my-4">
				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>

				                    <input v-model="registerForm.name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">

				                    <p v-if="authErrors && authErrors.meta.name" class="text-red-500 text-xs italic">{{authErrors.meta.name[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>

				                    <input v-model="registerForm.email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">

				                    <p v-if="authErrors && authErrors.meta.email" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">City</label>

				                    <input v-model="registerForm.city" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">

				                    <p v-if="authErrors && authErrors.meta.city" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Gender</label>

				                    <div class="w-3/6 mr-4">
				                        <div class="flex items-center">
				                            <input v-model='registerForm.gender' type="radio" id="male" name="gender" value="male">
				                            <label for="male" class="ml-1">Male</label>
				                        </div>

				                        <div class="flex items-center">
				                            <input v-model='registerForm.gender' type="radio" id="female" name="gender" value="female">
				                            <label for="female" class="ml-1">Female</label>
				                        </div>
				                    </div>

				                    <p v-if="authErrors && authErrors.meta.gender" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Birthday</label>

				                    <div class="flex">
				                        <div class="flex-col justify-start items-center mr-4">
				                            <div class="inline-block relative">
				                                <select v-model="day" class="block w-12 h-6 px-2 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                                    <option v-for="i in 31">{{i}}</option>
				                                </select>

				                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                                    <i class="fas fa-caret-down"></i>
				                                </div>
				                            </div>
				                        </div>

				                        <div class="flex-col justify-start items-center mr-4">
				                            <div class="inline-block relative">
				                                <select v-model="month" class="block w-16 h-6 px-2 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                                    <option v-for="(month, index) in months" :value="index + 1">{{month}}</option>
				                                </select>

				                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                                    <i class="fas fa-caret-down"></i>
				                                </div>
				                            </div>
				                        </div>

				                        <div class="flex-col justify-start items-center mr-4">
				                            <div class="inline-block relative">
				                                <select v-model="year" class="block w-16 h-6 px-2 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                                    <option v-for="i in 2020" v-if="i > 1995">{{i}}</option>
				                                </select>

				                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                                    <i class="fas fa-caret-down"></i>
				                                </div>
				                            </div>
				                        </div>
				                    </div>

				                    <p v-if="authErrors && authErrors.meta.birthday" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Interest</label>

				                    <div class="w-3/6 flex mr-4">
				                        <div class="flex items-center mr-4">
				                            <input v-model='interested_in' type="checkbox" value="male" class="form-checkbox h-4 w-4">
				                            <span class="ml-1">Male</span>
				                        </div>

				                        <div class="flex items-center">
				                            <input v-model='interested_in' type="checkbox" value="female" class="form-checkbox h-4 w-4">
				                            <span class="ml-1">Female</span>
				                        </div>
				                    </div>

				                    <p v-if="authErrors && authErrors.meta.interest" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-4">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">About</label>

				                    <textarea v-model="registerForm.about" rows="3" class="w-full px-2 appearance-none border border-gray-400 text-gray-800 text-sm shadow focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a title"></textarea>

				                    <p v-if="authErrors && authErrors.meta.about" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
				                </div>

				                <div class="mb-6">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>

				                    <input v-model="registerForm.password" class="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">

				                    <p v-if="authErrors && authErrors.meta.password" class="text-red-500 text-xs italic">{{authErrors.meta.password[0]}}</p>
				                </div>

				                <div class="mb-6">
				                    <label class="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>

				                    <input v-model="registerForm.confirm_password" class="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">

				                    <p v-if="authErrors && authErrors.meta.confirm_password" class="text-red-500 text-xs italic">{{authErrors.meta.confirm_password[0]}}</p>
				                </div>

				                <div class="flex items-center justify-between">
				                    <a @click="changeRegisterMode" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#"> < Back To Log In!</a>

				                    <button @click="dispatchRegister" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Register</button>
				                </div>
				            </form>
				        </div>
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "Register",

				        data() {
				            return {
				                registerForm: {
				                    name: '',
				                    email: '',
				                    city: '',
				                    gender: '',
				                    birthday: '',
				                    interest: '',
				                    about: '',
				                    password: '',
				                    confirm_password: ''
				                },
				                interested_in: [],
				                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				                day: 1,
				                month: 1,
				                year: 1996,
				            }
				        },

				        computed: {
				            ...mapGetters({
				                authErrors: 'authErrors'
				            })
				        },

				        methods: {
				            changeRegisterMode() {
				                EventBus.$emit('changingRegisterMode')
				            },

				            dispatchRegister() {
				                this.editFields()
				                this.$store.dispatch('registerUser', this.registerForm)
				            },

				            editFields() {
				                if (this.interested_in.length > 1) {
				                    this.registerForm.interest = 'both'
				                } else {
				                    this.registerForm.interest = this.interested_in[0]
				                }

				                this.registerForm.birthday = this.year + '-' + this.month + '-' + this.day
				            }
				        }
				    }
				</script>

				<style>

				</style>

		[7.3.2] Main
			#resources->js->components->Main->Home.vue
				<template>
				    <div v-if="authUser" class="flex flex-col h-screen overflow-y-hidden">
				        <Navbar />

				        <div class="flex flex-1 overflow-y-hidden">
				            <Sidebar />

				            <div class="w-9/12 overflow-x-hidden">
				                <router-view />
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import Navbar from "./Navbar";
				    import Sidebar from "./Sidebar";
				    import NewsFeed from "./NewsFeed";
				    import { mapGetters } from "vuex";

				    export default {
				        name: "Home",

				        components: {NewsFeed, Sidebar, Navbar},

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser'
				            }),
				        },

				        mounted() {
				            this.$store.dispatch('fetchAuthUser');
				        },
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Main->Navbar.vue
				<template>
				    <div class="flex justify-between items-center bg-blue-700 h-12 border-b border-gray-400 shadow-sm">
				        <div class="flex justify-start items-center">
				            <router-link to="/" class="ml-12 mr-2 text-4xl text-white">
				                <i class="fab fa-facebook"></i>
				            </router-link>

				            <SearchBlock />
				        </div>

				        <div class="w-full flex justify-center items-center h-full text-white">
				            <router-link to="/" :class="homeButtonClass">
				                <i class="fas fa-home"></i>
				            </router-link>

				            <router-link :to="'/users/' + authUser.id" :class="profileButtonClass">
				                <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + authUser.profile_image.path" alt="Profile Image">
				            </router-link>

				            <router-link to="/" class="flex items-center h-full px-6 text-2xl text-white border-b-2 border-blue-700 hover:border-white">
				                <i class="fab fa-facebook-messenger"></i>
				            </router-link>
				        </div>

				        <div class="w-1/3 relative flex justify-end mr-8 text-2xl">
				            <button @click="notificationMode = ! notificationMode" class="hover:text-white focus:outline-none focus:text-white">
				                <i class="fas fa-bell mx-6"></i>
				                <div v-if="unreadNotifications.length > 0" class="absolute h-5 w-5 top-0 ml-8 flex items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"><p>{{unreadNotifications.length}}</p></div>
				            </button>

				            <div v-if="notificationMode" @click="notificationMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				            <div v-if="notificationMode" class="absolute right-0 w-96 mr-20 mt-10 shadow-2xl bg-white border-b border-gray-400">
				                <NotificationBlock />
				            </div>

				            <button class="hover:text-white focus:outline-none"><i class="fas fa-cog mx-6"></i></button>
				        </div>
				    </div>
				</template>

				<script>
				    import { mapGetters } from 'vuex';
				    import NotificationBlock from "../Extra/NotificationBlock";
				    import SearchBlock from "../Extra/SearchBlock";

				    export default {
				        name: "Navbar",

				        components: {SearchBlock, NotificationBlock},

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				                title: 'title',
				                unreadNotifications: 'unreadNotifications'
				            }),

				            notificationMode: {
				                get() {
				                    return this.$store.getters.notificationMode;
				                },
				                set(notificationMode) {
				                    return this.$store.commit('setNotificationMode', notificationMode);
				                }
				            },

				            homeButtonClass() {
				                if(this.title == 'NewsFeed | Facebook') {
				                    return 'flex items-center h-full px-6 text-white text-2xl border-b-2 border-white'
				                }
				                return 'flex items-center h-full px-6 text-2xl text-white border-b-2 border-blue-700 hover:border-white'
				            },

				            profileButtonClass() {
				                if(this.title == 'Profile | Facebook') {
				                    return 'flex items-center h-full px-6 text-2xl border-b-2 hover:text-white focus:outline-none'
				                }
				                return 'flex items-center h-full px-6 text-2xl border-b-2 border-blue-700 hover:border-white'
				            }
				        },

				        created() {//Just to trigger the unreadNotificationCount
				            this.$store.dispatch('fetchAllNotifications')
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Main->NewsFeed.vue
				<template>
				    <div class="flex">
				        <div class="flex flex-col w-8/12 items-center py-4">
				            <CreatePost />

				            <ShowPosts />
				        </div>

				        <ShowFeatures />
				    </div>
				</template>

				<script>
				    import CreatePost from "../Post/CreatePost";
				    import ShowPosts from "../Post/ShowPosts";
				    import ShowFeatures from "../Feature/ShowFeatures";

				    export default {
				        name: "NewsFeed",

				        components: {ShowFeatures, CreatePost, ShowPosts}
				    }
				</script>

				<style scoped>

				</style>


			#resources->js->components->Main->Profile.vue
				<template>
				    <div>
				        <ShowUser />
				    </div>
				</template>

				<script>
				    import ShowUser from "../User/ShowUser";

				    export default {
				        name: "Profile",
				        components: {ShowUser}
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Main->Sidebar.vue
				<template>
				    <div class="w-3/12 p-4 bg-white border-r-2 border-gray-400 shadow-sm">
				        <router-link v-for="tab in generalTabs" :key="tab.title" v-if="tab.show" :to="tab.to" class="text-md font-semibold focus:outline-none">
				            <div class="flex mb-4">
				                <div class="w-8 text-center"><i :class="tab.icon"></i></div> {{tab.title}}
				            </div>
				        </router-link>

				        <div v-if="title == 'Marketplace | Facebook' || title == 'Categories | Facebook'">
				            <p class="ml-2 mb-4 text-sm text-gray-700 font-semibold">Categories</p>

				            <router-link v-for="tab in categoryTabs" :key="tab.title" :to="tab.to" class="text-sm font-normal focus:outline-none">
				                <div class="flex mb-4 items-center">
				                    <div :class="tab.circleColor"><i :class="tab.icon"></i></div> {{tab.title}}
				                </div>
				            </router-link>
				        </div>

				        <div>
				            <button @click="dispatchLogout" class="text-md font-semibold focus:outline-none">
				                <div class="flex">
				                    <div class="w-8 text-center"><i class="fas fa-sign-out-alt"></i></div> Logout
				                </div>
				            </button>
				        </div>
				    </div>
				</template/>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "Sidebar",

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				                title: 'title'
				            })
				        },

				        data(){
				            return {
				                categoryMode: false,

				                generalTabs: [
				                    {to: '/birthdays', show: User.loggedIn(), title: 'Birthday', icon: 'fas fa-birthday-cake'},
				                    {to: '/edituser', show: User.loggedIn(), title: 'Edit Profile', icon: 'fas fa-user-cog'},
				                    {to: '/items', show: User.loggedIn(), title: 'Marketplace', icon: 'fas fa-store-alt'},
				                ],

				                categoryTabs: [
				                    {to: '/category1items', title: 'Housing', circleColor: 'ml-4 mr-2 w-8 h-8 rounded-full bg-blue-500 text-center', icon: 'fas fa-house-user text-white mt-2'},
				                    {to: '/category2items', title: 'Electronics', circleColor: 'ml-4 mr-2 w-8 h-8 rounded-full bg-yellow-500 text-center', icon: 'fas fa-mobile-alt text-white mt-2'},
				                    {to: '/category3items', title: 'Clothing', circleColor: 'ml-4 mr-2 w-8 h-8 rounded-full bg-red-500 text-center', icon: 'fas fa-tshirt text-white mt-2'},
				                    {to: '/category4items', title: 'Entertainment', circleColor: 'ml-4 mr-2 w-8 h-8 rounded-full bg-green-500 text-center', icon: 'fas fa-gamepad text-white mt-2'},
				                    {to: '/category5items', title: 'Vehicles & bikes', circleColor: 'ml-4 mr-2 w-8 h-8 rounded-full bg-pink-500 text-center', icon: 'fas fa-car text-white mt-2'},
				                ],
				            }
				        },

				        methods: {
				            dispatchLogout() {
				                this.$store.dispatch('logoutAuthUser')
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>


		[7.3.3] Post
			#resources->js->components->Post->CreatePost.vue
				<template>
				    <div class="w-5/6 py-1 px-4 bg-white shadow rounded">
				        <div class="flex justify-between items-center py-3 border-b-2 border-gray-400">
				            <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + authUser.profile_image.path" alt="Profile Image">

				            <input v-if="! editMode" v-model="body" type="text" class="flex-auto mx-4 h-8 pl-4 rounded-full bg-gray-200 focus:outline-none focus:shadow-outline" placeholder="Add a post">

				            <input v-else v-model="post.body" type="text" class="flex-auto mx-4 h-8 pl-4 rounded-full bg-gray-200 focus:outline-none focus:shadow-outline" placeholder="Add a post">

				            <div v-if="! editMode">
				                <transition name="fade">
				                    <button v-if="body" @click="dispatchCreatePost" class="px-2 text-xl">
				                        <i class="fas fa-share"></i>
				                    </button>
				                </transition>
				            </div>

				            <div v-else>
				                <transition name="fade">
				                    <button v-if="post.body" @click="dispatchUpdatePost(post), post.body=''" class="px-2 text-xl">
				                        <i class="fas fa-edit"></i>
				                    </button>
				                </transition>

				                <button @click="commitCancelEdit(post)" class="w-8 h-8 rounded-full text-xl bg-gray-200">
				                    <i class="far fa-window-close"></i>
				                </button>
				            </div>

				            <button v-if="type != 'profile'" ref="postImage" class="dz-clickable mx-2 w-8 h-8 rounded-full text-xl bg-gray-200 focus:outline-none">
				                <p class="dz-clickable"><i class="fas fa-image"></i></p>
				            </button>
				        </div>

				        <div class="mx-4 my-4 flex justify-between items-center text-sm text-gray-700 font-medium">
				            <p><i class="fas fa-photo-video text-green-500 mr-1"></i> Photo/Video</p>
				            <p><i class="fas fa-user-plus text-blue-500 mr-1"></i> Tag Friend</p>
				            <p><i class="fab fa-font-awesome-flag text-yellow-500 mr-1"></i> Life Events</p>
				        </div>

				        <div v-if="editMode && post.pictures.picture_count > 0" class="flex">
				            <div v-for="picture in post.pictures.data" :key="index" class="mr-1 mt-5">
				                <img :src="'/storage/' + picture.path" alt="Post Picture">
				            </div>
				        </div>

				        <div v-if="type != 'profile'" class="dropzone-previews flex">
				            <div id="dz-template" class="hidden">
				                <div class="dz-preview dz-file-preview mt-4">
				                    <div class="dz-details mr-1">
				                        <img data-dz-thumbnail class="w-32 h-32" alt="">

				                        <button data-dz-remove class="mt-2 ml-6 text-sm focus:outline-none"> <i class="fas fa-minus-circle text-red-500"></i> Remove</button>
				                    </div>

				                    <div class="dz-progress">
				                        <span class="dz-upload" data-dz-upload></span>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import _ from "lodash";
				    import { mapGetters } from 'vuex';
				    import Dropzone from 'dropzone';

				    export default {
				        name: "CreatePost",

				        props: ['type', 'friend_id'],

				        data() {
				            return {
				                editMode: false,
				                post: '',
				                originalPost: '',
				                dropzone: null,
				            }
				        },

				        mounted() {
				            this.type != 'profile'? this.dropzone = new Dropzone(this.$refs.postImage, this.settings) : null
				        },

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				            }),

				            body: {
				                get() {
				                    return this.$store.getters.body;
				                },
				                //_.debounce (function is to make sure the form is not updated after every character that user types.
				                set: _.debounce (function(body) {
				                    return this.$store.commit('setPostBody', body);
				                }, 1000)
				            },

				            settings() {
				                if(this.type != 'profile') {
				                    return {
				                        paramName: 'picture', //field name is image
				                        url: '/api/upload-pictures',
				                        acceptedFiles: 'image/*',
				                        clickable: '.dz-clickable', //<i> will not work as it is not a button. To make sure all the inner elements of button are clickable.
				                        autoProcessQueue: false, //When the image is uploaded, it sends it right away which will give the error becasue we do not have the body in params.
				                        previewsContainer: '.dropzone-previews',
				                        previewTemplate: document.querySelector('#dz-template').innerHTML,
				                        maxFiles: 5,
				                        parallelUploads: 5,
				                        uploadMultiple:true,
				                        params: { //Cannot pass body here because settings() load when the component is mounted. Use sending.
				                            'width': 750,
				                            'height': 750,
				                        },
				                        headers: {
				                            //'X-CSRF-TOKEN': document.head.querySelector('meta[name=csrf-token]').content, (For api, when token is not needed)

				                            'Authorization': `Bearer ${localStorage.getItem('token')}`
				                        },
				                        sending: (file, xhr, postForm) => {
				                            postForm.append('body', this.post.body || this.$store.getters.body)
				                            postForm.append('post_id', this.post.id)
				                        },
				                        success: (e, res) => {
				                            this.dropzone.removeAllFiles()

				                            this.$store.commit('setPostBody', '')

				                            //this.$store.commit('pushPost', res) For multiple images post, it will commit the response multiple times.
				                            this.$store.dispatch('fetchAllPosts')
				                        },
				                        maxfilesexceeded: file => {
				                            this.dropzone.removeAllFiles()

				                            this.dropzone.addFile(file)
				                        }
				                    }
				                }
				            },
				        },

				        created() {
				            EventBus.$on('changingEditMode', (post) => {
				                this.editMode = true
				                this.post = post
				                this.originalBody = post.body
				            })
				        },

				        methods: {
				            dispatchCreatePost() {
				                if (this.type != 'profile' && this.dropzone.getAcceptedFiles().length) {
				                    this.dropzone.processQueue()
				                } else if (this.type == 'profile' && this.friend_id != this.authUser.id) {
				                    this.$store.dispatch('wishBirthday', {body: this.body, friend_id: this.friend_id})
				                } else {
				                    this.$store.dispatch('createPost')
				                }
				            },

				            dispatchUpdatePost(post) {
				                this.editMode = false

				                if (this.type != 'profile' && this.dropzone.getAcceptedFiles().length) {
				                    this.dropzone.processQueue()
				                } else {
				                    this.$store.dispatch('updatePost', post)
				                }
				            },

				            commitCancelEdit(post) {
				                this.editMode = false

				                post.body = this.originalBody

				                this.$store.commit('cancelEdit', post)
				            }
				        }
				    }
				</script>

				<style scoped>
				    .fade-enter-active, .fade-leave-active {
				        transition: opacity .5s;
				    }
				    .fade-enter, .fade-leave-to {
				        opacity: 0;
				    }
				</style>

			#resources->js->components->Post->ShowPosts.vue
				<template>
				    <div class="flex flex-col items-center justify-center py-4">
				        <p v-if="status == 'loading'">Loading Posts...</p>

				        <PostCard class="w-5/6" v-for="(post, index) in posts" :key="index" :post="post" />
				    </div>
				</template>

				<script>
				    import { mapGetters } from "vuex";
				    import PostCard from "../Extra/PostCard";

				    export default {
				        name: "ShowPosts",

				        components: {PostCard},

				        computed: {
				            ...mapGetters({
				                posts: 'posts',
				                status: 'postStatus',
				            })
				        },

				        created() {
				            this.$store.dispatch('fetchAllPosts');
				        }
				    }
				</script>

				<style scoped>

				</style>


		[7.3.4] Extra
			#resources->js->components->Extra->PostCard.vue
				<template>
				    <div class="bg-white rounded mt-4 shadow">
				        <div class="p-4">
				            <div class="flex justify-between items-center">
				                <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + post.posted_by.profile_image.path" alt="Profile Image">

				                <div v-if="! post.shared_post" class="flex-auto mx-4">
				                    <div v-if="! post.posted_on"><p class="text-sm font-bold text-blue-700">{{post.posted_by.name}}</p></div>
				                    <div v-else><p class="text-sm font-bold text-blue-700">{{post.posted_by.name}} <i class="fas fa-caret-right mx-1 text-md text-gray-500"></i> {{post.posted_on.name}}</p></div>

				                    <p class="text-xs text-gray-600">{{post.created_at}}</p>
				                </div>

				                <div v-else class="flex-auto mx-4">
				                    <p class="text-sm text-gray-600"><span class="font-bold text-blue-700">{{post.posted_by.name}}</span> shared a <span class="font-bold text-blue-700">Post </span></p>

				                    <div><p class="text-xs text-gray-600">{{post.created_at}} <i class="fas fa-retweet ml-1"></i></p></div>
				                </div>

				                <div class="dropdown inline-block relative">
				                    <button class="text-xl font-bold px-4 rounded items-center focus:outline-none">...</button>

				                    <ul class="dropdown-menu absolute hidden text-gray-700 text-sm shadow-lg border border-gray-400">
				                        <li><button @click="commitEditPost(post, $vnode.key)" class="w-24 py-2 px-4 block text-left font-semibold bg-white hover:bg-gray-300 focus:outline-none">Edit</button></li>
				                        <li><button @click="dispatchDeletePost(post.id, $vnode.key)" class="w-24 py-2 px-4 block text-left font-semibold bg-white hover:bg-gray-300 focus:outline-none">Delete</button></li>
				                    </ul>
				                </div>
				            </div>

				            <div class="mt-4">
				                <p>{{post.body}}</p>
				            </div>
				        </div>

				        <div v-if="post.pictures.picture_count != 0" class="flex px-4">
				            <div v-for="picture in post.pictures.data" class="w-full ml-1 mt-2">
				                <img :src="'/storage/' + picture.path" class="w-full" alt="Post Picture">
				            </div>
				        </div>

				        <div v-if="post.shared_post" class="flex flex-col border-t border-b border-gray-400 bg-gray-200 my-1">
				            <div v-if="post.shared_post.pictures.picture_count != 0" class="flex">
				                <div v-for="picture in post.shared_post.pictures.data">
				                    <img :src="'/storage/' + picture.path" alt="Post Picture">
				                </div>
				            </div>

				            <div v-else class="flex justify-between items-center pt-4 px-8">
				                <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + post.shared_post.posted_by.profile_image.path" alt="Profile Image">

				                <div class="flex-auto mx-4">
				                    <p class="text-sm font-bold text-blue-700">{{post.shared_post.posted_by.name}}</p>
				                    <p class="text-xs text-gray-600">{{post.shared_post.created_at}}</p>
				                </div>
				            </div>

				            <div class="py-4 px-8 text-sm font-medium">
				                <p>{{post.shared_post.body}}</p>
				            </div>
				        </div>

				        <div class="flex justify-between p-4 text-sm text-gray-700 font-medium">
				            <div class="flex">
				                <div class="flex items-center h-6 w-6 rounded-full bg-blue-500 text-white mr-1"><i class="fas fa-thumbs-up mx-auto text-xs"></i></div>

				                {{post.likes.like_count}}
				            </div>

				            <div class="flex">
				                <p class="mr-4">{{post.comments.data.length}} Comments</p>

				                <p class="ml-4">{{post.shared_count}} Shares</p>
				            </div>
				        </div>

				        <div class="flex justify-between items-center border-t border-gray-300 text-sm text-gray-700 py-2">
				            <button @click="dispatchLikePost(post.id, $vnode.key)" :class="likeColor"><i class="fas fa-thumbs-up mr-1"></i> Like</button>

				            <button @click="commentMode = ! commentMode" class="w-full font-medium hover:text-blue-600 focus:outline-none"><i class="fas fa-comments mr-1"></i> Comments</button>

				            <button @click="shareMode = true" class="w-full font-medium hover:text-blue-600 focus:outline-none"><i class="fas fa-share mr-1"></i> Share</button>
				        </div>

				        <div v-if="shareMode" class="w-screen h-screen bg-black bg-opacity-25 absolute z-0 left-0 top-0 right-0 bottom-0"></div>

				        <div v-if="shareMode" class="absolute inset-0 flex justify-center items-center">
				            <ShareCard :post="post" :post_index="$vnode.key" />
				        </div>

				        <div v-if="commentMode">
				            <CreateComment :post_id="post.id" :post_index="$vnode.key"></CreateComment>

				            <div v-for="(comment, index) in post.comments.data">
				                <CommentCard :comment="comment" :comment_index="index" :post="post" :post_index="$vnode.key" />
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import CommentCard from "./CommentCard";
				    import CreateComment from "../Comment/CreateComment";
				    import ShareCard from "./ShareCard";

				    export default {
				        name: "PostCard",

				        components: {ShareCard, CreateComment, CommentCard},

				        props: ['post'],

				        computed: {
				            likeColor() {
				                return this.post.likes.user_liked ? 'w-full text-blue-600 font-medium focus:outline-none' : 'w-full hover:text-blue-700 font-medium focus:outline-none'
				            }
				        },

				        data() {
				            return {
				                commentBody: '',
				                commentMode: false,
				                shareMode: false,
				            }
				        },

				        created() {
				            EventBus.$on('changingShareMode', () => {
				                this.shareMode = false
				            })
				        },

				        methods: {
				            commitEditPost(post, index) {
				                this.$store.commit('splicePost', {post, index})

				                EventBus.$emit('changingEditMode', post)
				            },

				            dispatchDeletePost(post_id, index) {
				                this.$store.dispatch('deletePost', {post_id, index})
				            },

				            dispatchLikePost(post_id, index) {
				                this.$store.dispatch('likeDislikePost', {post_id, index})
				            }
				        }
				    }
				</script>

				<style scoped>
				    .dropdown:hover .dropdown-menu {
				        display: block;
				    }
				</style>

			#resources->js->components->Extra->CommentCard.vue
				<template>
				    <div class="flex justify-between">
				        <div :class="commentClass">
				            <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + comment.commented_by.profile_image.path" alt="Profile Image">

				            <div>
				                <div class="flex-auto ml-2 bg-gray-200 rounded-lg p-2 text-sm">
				                    <router-link :to="'/users/' + comment.commented_by.id" class="font-bold text-blue-700">
				                        {{comment.commented_by.name}}
				                    </router-link>

				                    <p v-if="! commentEditMode && ! comment.tag.taggedUserName" class="inline">{{comment.body}}</p>

				                    <p v-else-if="! commentEditMode && comment.tag.taggedUserName">{{comment.tag.newBody[0]}}<router-link :to="'/users/' + comment.tag.taggedUserID" class="text-blue-700 font-semibold">{{comment.tag.taggedUserName}}</router-link> {{comment.tag.newBody[1]}}</p>

				                    <div v-else class="relative inline ml-2">
				                        <input v-model="comment.body" @input="checkTags(comment.body)" class="outline-none px-2 border border-gray-400"></input>

				                        <div v-if="tagMode" @click="tagMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				                        <div v-if="tagMode" class="absolute bg-white w-56 mt-4 top-0 text-xs shadow-2xl z-20 border border-gray-300">
				                            <div v-for="user in searchResult" :key='user.id'>
				                                <button @click="tagUser(user), tagMode = false" class="flex w-full items-center p-2 text-gray-800 font-semibold border-b border-gray-200 hover:bg-blue-700 hover:text-white">
				                                    <img class="w-8 h-8 object-cover" :src="'/storage/' + user.profile_image.path" alt="Profile Image">

				                                    <p class="mx-2">{{user.name}}</p>
				                                </button>
				                            </div>
				                        </div>

				                        <button @click="dispatchEditComment(comment.id, comment_index, comment.body, comment.post_id, post_index), commentEditMode = false" class="ml-2 text-gray-700 focus:outline-none"><i class="fas fa-check-circle"></i></button>

				                        <button @click="cancelEditComment()" class="ml-2 text-gray-700 focus:outline-none"><i class="fas fa-ban"></i></button>
				                    </div>
				                </div>

				                <div v-if="comment.gif">
				                    <img :src="'/storage/' + comment.gif" class="ml-2 p-2">
				                </div>

				                <div class="relative flex justify-between text-xs">
				                    <div class="flex w-full">
				                        <div v-if="favouriteMode" class="absolute">
				                            <div class="flex justify-center items-center bg-white border shadow-2xl rounded-l-full rounded-r-full text-lg -mt-8">
				                                <button @click="dispatchFavouriteComment(comment.id, comment_index, comment.post_id, post_index, 1), favouriteMode = ! favouriteMode" class="mx-2">❤️</button>
				                                <button @click="dispatchFavouriteComment(comment.id, comment_index, comment.post_id, post_index, 2), favouriteMode = ! favouriteMode" class="mx-2">😝</button>
				                                <button @click="dispatchFavouriteComment(comment.id, comment_index, comment.post_id, post_index, 3), favouriteMode = ! favouriteMode" class="mx-2">😢</button>
				                            </div>
				                        </div>

				                        <button v-if="! comment.user_favourited" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Like</button>
				                        <button v-if="comment.user_favourited && comment.favourited_type == 1" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">❤</button>
				                        <button v-if="comment.user_favourited && comment.favourited_type == 2" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">😝</button>
				                        <button v-if="comment.user_favourited && comment.favourited_type == 3" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">😢</button>

				                        <button @click="changeEditMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Edit</button>

				                        <button @click="dispatchDeleteComment(comment.id, comment_index, comment.post_id, post_index)" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Delete</button>

				                        <p class="ml-4 text-xs">{{comment.updated_at}}</p>
				                    </div>

				                    <div>
				                        <div class="flex justify-center items-center bg-white border shadow-2xl rounded-l-full rounded-r-full text-sm -mt-2 px-1">
				                            <p>❤️</p>
				                            <p>😝</p>
				                            <p>😢</p>
				                            <p class="ml-2 font-medium text-gray-600">{{comment.favourites.favourite_count}}</p>
				                        </div>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>
				</template/>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "CommentCard",

				        props: ['comment', 'comment_index', 'post', 'post_index'],

				        computed: {
				            ...mapGetters({
				                searchResult: 'searchResult',
				            }),

				            commentClass() {
				                if (this.comment.gif) {
				                    return 'flex px-4 py-2'
				                }

				                return 'flex px-4 py-2 items-center'
				            }
				        },

				        data() {
				            return {
				                orginalCommentBody: null,
				                originalTaggedUserName: null,
				                originalTaggedUserID: null,
				                originalNewBody: null,

				                commentEditMode: false,
				                gifMode: false,
				                favouriteMode: false,
				                tagMode: false,
				                hasTag: false,
				            }
				        },

				        created() {
				            this.orginalCommentBody = this.post.comments.data[0].body
				            this.originalTaggedUserName = this.post.comments.data[0].taggedUserName
				            this.originalTaggedUserID = this.post.comments.data[0].taggedUserID
				            this.originalNewBody = this.post.comments.data[0].newBody
				        },

				        methods: {
				            dispatchEditComment(comment_id, comment_index, comment_body, post_id, post_index) {
				                this.$store.dispatch('updateComment', {comment_id, comment_index, comment_body, post_id, post_index})

				                if(! this.comment.body.includes('@')) {
				                    this.comment.tag.taggedUserName = null
				                    this.comment.tag.taggedUserID = null
				                    this.comment.tag.newBody = null
				                }
				                this.orginalCommentBody = this.comment.body
				            },

				            dispatchDeleteComment(comment_id, comment_index, post_id, post_index) {
				                this.$store.dispatch('deleteComment', {comment_id, comment_index, post_id, post_index})
				                this.orginalCommentBody = this.post.comments.data[0].body
				            },

				            dispatchFavouriteComment(comment_id, comment_index, post_id, post_index, type) {
				                this.$store.dispatch('favouriteUnfavouriteComment', {comment_id, comment_index, post_id, post_index, type})
				            },

				            checkTags(body) {
				                if(body.includes('@') && ! this.hasTag) { //Because we are allowing to use @ only once. Only dispatch result if @ doesn't exist at all.
				                    let index = body.indexOf('@')
				                    let searchTerm = body.substring(index + 1, index + 2)

				                    this.tagMode = true
				                    this.$store.dispatch('fetchSearchResult', searchTerm)
				                }
				            },

				            tagUser(user) { //I can pass body from the top as well but then I will have to creat 2 different buttons for editMode true and false which why this is another way to make <template> code look simple
				                this.comment.body = this.comment.body.replace('@', `@${user.name} `)
				                this.comment.tag.taggedUserName = user.name
				                this.comment.tag.taggedUserID = user.id
				                this.comment.tag.newBody = this.comment.body.split(user.name)
				                this.tagMode = false
				                this.hasTag = true
				            },

				            cancelEditComment() {
				                this.commentEditMode = false
				                this.comment.body = this.orginalCommentBody
				                if(this.comment.tag.taggedUserName != null) {
				                    this.comment.tag.taggedUserName = this.originalTaggedUserName
				                    this.comment.tag.taggedUserID = this.originalTaggedUserID
				                    this.comment.tag.newBody = this.originalNewBody
				                } else {
				                    this.comment.tag.taggedUserName = null
				                    this.comment.tag.taggedUserID = null
				                    this.comment.tag.newBody = null
				                }
				                this.hasTag = false
				            },

				            changeEditMode() {
				                this.commentEditMode = ! this.commentEditMode
				                this.orginalCommentBody = this.comment.body
				                this.originalTaggedUserName = this.comment.tag.taggedUserName
				                this.originalTaggedUserID = this.comment.tag.taggedUserID
				                this.originalNewBody = this.comment.tag.newBody
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->UploadAvatar.vue
				<template>
				    <div>
				        <img :class="avatarClass" :src="'/storage/' + avatarObject.path" :alt="avatarAlt" ref="userAvatar">
				    </div>
				</template>

				<script>
				    import Dropzone from 'dropzone';
				    import { mapGetters } from 'vuex';

				    export default {
				        name: "UploadAvatar",

				        props: ['newAvatar', 'avatarClass', 'avatarAlt', 'avatarWidth', 'avatarHeight', 'avatarType'],

				        data() {
				            return {
				                dropzone: null
				            }
				        },

				        mounted() {
				            if(this.authUser.id == this.$route.params.userId) {
				                this.dropzone = new Dropzone(this.$refs.userAvatar, this.settings);
				            }
				        },

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				            }),

				            settings() {
				                return {
				                    paramName: 'avatar', //field name is image
				                    url: '/api/upload-avatars',
				                    acceptedFiles: 'image/*',
				                    params: {
				                        'width': this.avatarWidth,
				                        'height': this.avatarHeight,
				                        'type' : this.avatarType
				                    },
				                    headers: {
				                        //'X-CSRF-TOKEN': document.head.querySelector('meta[name=csrf-token]').content,

				                        'Authorization': `Bearer ${localStorage.getItem('token')}`
				                    },
				                    success: (e, res) => {
				                        /*  One Way

				                            this.cover_image = res will not work because we can not mutate the props.
				                            The image will change in the profile but not in posts, comments and navbar.

				                            this.uploadedImage = res.data
				                         */
				                        this.$store.dispatch('fetchAuthUser')
				                        this.$store.dispatch('fetchUser', this.$route.params.userId)
				                        this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
				                        this.$store.dispatch('fetchAllAvatars', this.$route.params.userId)
				                    }
				                };
				            },

				            //Tt is not required if we are dispatching events because as we are not changing uploadedImage, it will call this.newImage anyway. Just change it on the :scr at the top.
				            avatarObject() {
				                return null || this.newAvatar
				            }
				        }

				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->ItemCard.vue
				<template>
				    <div class="relative w-56 h-max rounded shadow-lg mr-6 mb-4 bg-white">
				        <router-link :to="'/items/' + item.id">
				            <img class="w-full" v-if="item.images.image_count > 0" :src="'/storage/' + item.images.data.slice(-1)[0].path" alt="Post Picture">

				            <img v-else class="w-full" src="https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg" alt="Post Picture">
				        </router-link>

				        <div class="absolute w-max text-center">
				            <p class="-my-8 ml-2 px-1 rounded text-white text-sm bg-gray-900">${{item.price}}</p>
				        </div>

				        <div class="px-4 py-2">
				            <div class="font-medium h-6 text-base overflow-y-hidden">{{item.title}}</div>

				            <p class="mt-4 h-16 text-gray-800 text-sm overflow-y-hidden">{{item.description}}</p>

				            <div class="flex justify-between items-center mt-4">
				                <p class="text-xs text-gray-600">{{item.created_at}}</p>

				                <button @click="dispatchBookmarkItem(item.id, index)" :class="bookmarkColor" class="focus:outline-none"><i class="fas fa-bookmark"></i></button>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    export default {
				        name: "ItemCard",

				        props: ['item', 'index'],

				        computed: {
				            bookmarkColor() {
				                return this.item.bookmarks.user_bookmarked ? 'text-md text-blue-600' : 'text-md text-gray-500'
				            }
				        },

				        methods: {
				            dispatchBookmarkItem(item_id, item_index) {
				                this.$store.dispatch('bookmarkUnbookmarkItem', {item_id, item_index})
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->ItemDetailCard.vue
				<template>
				    <div v-if="item" class="flex flex-col items-center py-4">
				        <div class="w-2/3 bg-white rounded mt-6 shadow">
				            <div v-if="item.images.image_count != 0" class="flex">
				                <div  v-for="image in item.images.data" :class="multipleImagesClass">
				                    <img :src="'/storage/' + image.path" alt="Item Picture">
				                </div>
				            </div>

				            <img v-else class="w-full" src="https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg" alt="Post Picture">

				            <div v-if="! editMode" class="flex flex-col p-4">
				                <div class="flex justify-between items-center">
				                    <p class="text-2xl font-medium">{{item.title}}</p>

				                    <button class="text-gray-700 text-sm font-medium"><i class="fas fa-share"></i>  Share</button>
				                </div>

				                <p v-if="! editMode" class="text-xl font-normal text-green-600">${{item.price}}</p>

				                <button class="mt-2 h-8 bg-blue-700 text-white text-sm font-semibold shadow-2xl focus:outline-none">Message Seller</button>

				                <button class="mt-2 h-8 bg-white border border-gray-500 text-gray-600 text-sm font-semibold shadow-2xl focus:outline-none">Make Offer</button>
				            </div>

				            <div v-else class="flex flex-col p-4">
				                <div class="flex justify-between items-center">
				                    <input v-model="item.title" class="w-9/12 text-2xl font-medium focus:outline-none">

				                    <div>
				                        <button @click="dispatchEditItem(item.id, item.title, item.description, item.price), editMode = false" class="px-2 py-1 text-sm bg-blue-700 rounded text-white font-medium">Save</button>
				                        <button @click="dispatchCancelEdit(item.id, item.title, item.description, item.price), editMode = false" class="px-2 py-1 text-sm bg-white border border-gray-500 text-gray-600 rounded font-medium">Cancel</button>
				                    </div>
				                </div>

				                <div class="flex text-xl font-normal text-green-600">
				                    <p>$</p><input v-model="item.price" class="focus:outline-none">
				                </div>

				                <button class="mt-2 h-8 bg-blue-700 text-white text-sm font-semibold shadow-2xl focus:outline-none">Message Seller</button>

				                <button class="mt-2 h-8 bg-white border border-gray-500 text-gray-600 text-sm font-semibold shadow-2xl focus:outline-none">Make Offer</button>
				            </div>

				            <div class="p-4">
				                <div class="flex justify-between items-center">
				                    <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + item.posted_by.profile_image.path" alt="Profile Image">

				                    <div class="flex-auto mx-4">
				                        <p class="text-sm font-bold">{{item.posted_by.name}}</p>
				                        <p class="text-xs text-gray-600">{{item.created_at}}</p>
				                    </div>

				                    <div class="dropdown inline-block relative">
				                        <button class="text-xl font-bold px-4 rounded items-center focus:outline-none">...</button>

				                        <ul class="dropdown-menu pt-1 absolute hidden text-gray-700 text-sm">
				                            <li><button @click="editMode = true" class="w-24 py-2 px-4 block text-left rounded-t font-semibold bg-gray-400 hover:bg-gray-300 focus:outline-none">Edit</button></li>

				                            <li><button @click="dispatchDeleteItem(item.id)" class="w-24 py-2 px-4 block text-left rounded-b font-semibold bg-gray-400 hover:bg-gray-300 focus:outline-none">Delete</button></li>
				                        </ul>
				                    </div>
				                </div>

				                <div v-if="! editMode" class="mt-4">
				                    <p>{{item.description}}</p>
				                </div>

				                <div v-else class="mt-4">
				                    <textarea v-model="item.description" class="w-full focus:outline-none"></textarea>
				                </div>
				            </div>

				            <div class="flex justify-between p-4 text-sm">
				                <p><i class="fas fa-bookmark text-gray-800 mr-1"></i>4 Bookmarks</p>

				                <p>43 Replies</p>
				            </div>

				            <div class="flex p-4 text-sm border-t border-gray-300">
				                <button class="w-1/2"><i class="far fa-bookmark text-gray-800 mr-1"></i>Bookmark</button>

				                <button class="w-1/2"><i class="far fa-comment-alt"></i> Reply</button>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    export default {
				        name: "ItemDetailCard",

				        props: ['item'],

				        data() {
				            return {
				                editMode: false,
				                replyMode: false,
				            }
				        },

				        computed: {
				            multipleImagesClass() {
				                if(this.item.images.data.length > 1) {
				                    return 'mx-2 mt-2' || ''
				                }
				            }
				        },

				        methods: {
				            dispatchDeleteItem(item_id) {
				                this.$store.dispatch('deleteItem', item_id)

				                this.$router.push('/items')
				            },

				            dispatchCancelEdit() {
				                this.$store.dispatch('showItem', this.$route.params.itemId)
				            },

				            dispatchEditItem(id, title, description, price) {
				                this.$store.dispatch('editItem', {id, title, description, price})
				            }
				        }
				    }
				</script>

				<style scoped>
				    .dropdown:hover .dropdown-menu {
				        display: block;
				    }
				</style>

			#resources->js->components->Extra->ShareCard.vue
				<template>
				    <div class="w-3/6 shadow-2xl bg-white">
				        <div class="flex justify-between items-center bg-blue-700 px-4 text-md font-semibold text-gray-200">
				            <p>Share this Post</p>

				            <p><i class="fas fa-lock"></i></p>
				        </div>

				        <div class="flex justify-between items-center py-2 mx-4 bg-white border-b-2 border-gray-300 text-xs text-gray-600 font-medium">
				            <p class=""><i class="fab fa-creative-commons-share"></i> Share with friends</p>

				            <p class=""><i class="fas fa-cogs"></i> Manage sharing settings</p>
				        </div>

				        <div class="mx-8 mt-8 mb-2">
				            <textarea v-model="body" rows="3" placeholder="Write your caption..." class="w-full p-2 border border-gray-500"></textarea>
				        </div>

				        <div class="flex justify-between items-start px-8 mt-2 mb-8 bg-white">
				            <img v-if="post.pictures.picture_count == 0" class="w-24 h-24 object-cover" :src="'/storage/' + post.posted_by.profile_image.path" alt="Profile Image">
				            <img v-else class="w-24 h-24 object-cover" :src="'/storage/' + post.pictures.data[0].path" alt="Profile Image">

				            <div class="flex-auto mx-4">
				                <p class="text-sm font-bold text-blue-700">{{post.posted_by.name}}</p>
				                <p class="text-xs text-gray-600">{{post.created_at}}</p>
				                <p class="mt-2 text-sm font-medium">{{post.body}}</p>
				            </div>
				        </div>

				        <div class="flex justify-end items-center bg-gray-200 px-4 text-sm">
				            <button @click="dispatchSharePost(body, post.id, post_index)" class="px-2 py-1 m-2 bg-blue-700 text-white font-semibold rounded shadow-lg">Share Post</button>

				            <button @click="changeShareMode" class="px-2 py-1 m-2 bg-gray-200 text-gray-800 font-semibold rounded border border-gray-500 shadow-lg">Cancel</button>
				        </div>
				    </div>
				</template>

				<script>
				    export default {
				        name: "ShareCard",

				        props: ['post', 'post_index'],

				        data() {
				            return {
				                body: ''
				            }
				        },

				        methods: {
				            changeShareMode() {
				                EventBus.$emit('changingShareMode')
				            },

				            dispatchSharePost(body, repost_id, repost_index) {
				                this.$store.dispatch('sharePost', {body, repost_id, repost_index})

				                this.changeShareMode()

				                this.body = ''
				            },
				        }

				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->BirthdayFeature.vue
				<template>
				    <div class="w-5/6 bg-white rounded mt-4 shadow">
				        <div class="flex px-2 py-2 items-center border-b border-gray-400 justify-between">
				            <p class="text-gray-700 font-semibold text-sm">Birthdays</p>

				            <button @click="archiveMode = ! archiveMode" class="text-blue-600 font-medium text-sm"><i class="fas fa-eye-slash"></i> Archive</button>
				        </div>

				        <div v-if="! archiveMode" v-for="(birthdayUser, index) in birthdays.week" :key="index" class="flex p-2 justify-between items-center">
				            <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + birthdayUser.profile_image.path" alt="Profile Image">

				            <div class="flex-auto mx-4">
				                <p class="text-sm font-bold text-blue-700">{{birthdayUser.name}}</p>

				                <div>
				                    <p v-if="birthdayUser.birthday.when > 0" class="text-xs text-gray-600">Has birthday in {{birthdayUser.birthday.when}} Days</p>
				                    <div v-else-if="birthdayUser.birthday.when == 0">
				                        <p v-if="birthdayUser.id != authUser.id" class="text-xs text-gray-600">Has birthday Today</p>
				                        <p v-else class="text-xs text-gray-700 font-semibold">It's your birthday today!</p>
				                    </div>
				                    <p v-else class="text-xs text-gray-600">Had birthday {{birthdayUser.birthday.when}} Days ago</p>
				                </div>
				            </div>
				        </div>
				    </div>
				</template/>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "BirthdayFeature",

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				                birthdays: 'birthdays',
				            })
				        },

				        data() {
				            return {
				                archiveMode: false
				            }
				        },

				        created() {
				            this.$store.dispatch('fetchAllBirthdays');
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->BirthdayBlock.vue
				<template>
				    <div class="w-5/6 bg-white rounded my-4 shadow">
				        <div class="flex justify-between items-center px-2 py-2  border-b border-gray-400">
				            <p class="text-gray-800 font-semibold text-sm">{{title}}</p>

				            <p class="text-gray-600 font-medium text-sm">{{current_date}}</p>
				        </div>

				        <div v-for="(birthdayUser, index) in birthdays" :key="birthdayUser.id" class="">
				            <birthday-card :birthdayUser="birthdayUser" />
				        </div>
				    </div>
				</template/>

				<script>
				    import BirthdayCard from "./BirthdayCard";

				    export default {
				        name: "BirthdayBlock",

				        components: {BirthdayCard},

				        props: ['birthdays', 'title', 'current_date']
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->BirthdayCard.vue
				<template>
				    <div v-if="birthdayUser.id != authUser.id" class="flex p-2 items-center">
				        <img class="w-20 h-20 object-cover rounded-full" :src="'/storage/' + birthdayUser.profile_image.path" alt="Profile Image">

				        <div class="w-full ml-4">
				            <div class="flex justify-between">
				                <p class="text-sm font-bold text-blue-700">{{birthdayUser.name}}</p>

				                <p class="text-sm font-medium text-gray-600">{{birthdayUser.birthday.age}} years old</p>
				            </div>

				            <textarea v-if="createMode" v-model="body" rows="2" class="w-full mt-2 p-2 border border-gray-500 text-xs text-gray-700" placeholder="Wish your friend birthday here..."></textarea>
				            <p v-else class="py-2 text-xs font-normal text-gray-600">The post has been successfully submitted on{{birthdayUser.name}}'s newsfeed.</p>

				            <button v-if="createMode" @click="dispatchCreateBirthdayPost(body, birthdayUser.id)" class="text-xs font-semibold text-blue-700">Send</button>
				        </div>
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "BirthdayCard",

				        props: ['birthdayUser'],

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				            })
				        },

				        data() {
				            return {
				                body: '',
				                createMode: true,
				                alreadyWished: [],
				            }
				        },

				        created() {
				            if(localStorage.getItem("alreadyWished")) {
				                this.alreadyWished = localStorage.getItem("alreadyWished").split(",")
				            }

				            if (this.alreadyWished.includes(this.birthdayUser.id.toString())) {
				                this.createMode = false
				            }
				        },

				        methods: {
				            dispatchCreateBirthdayPost(body, friend_id) {
				                this.$store.dispatch('wishBirthday', {body, friend_id})
				                this.createMode = false
				                localStorage.setItem("alreadyWished", `${localStorage.getItem("alreadyWished")},${this.birthdayUser.id}`);
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->NotificationBlock.vue
				<template>
				    <div>
				        <div class="flex justify-between text-xs p-2 border-b border-gray-400">
				            <p class="text-gray-800 font-semibold">Notifications</p>

				            <div class="flex text-blue-700 font-medium">
				                <p class="px-4">Mark all as read</p>
				                <p>Settings</p>
				            </div>
				        </div>

				        <div class="h-80 overflow-y-scroll">
				            <div v-for="notification in allNotifications" :key="notification.id" class="border-b border-gray-300">
				                <NotificationCard :notification="notification" />
				            </div>
				        </div>

				        <div class="flex justify-center bg-gray-200 text-xs p-2">
				            <p class="text-blue-700 font-semibold">See All Notifications</p>
				        </div>
				    </div>
				</template>

				<script>
				    import NotificationCard from "./NotificationCard";
				    import {mapGetters} from "vuex";
				    export default {
				        name: "NotificationBlock",

				        components: {NotificationCard},

				        computed: {
				            ...mapGetters({
				                allNotifications: 'allNotifications',
				            }),
				        },

				        created() {
				            this.$store.dispatch('fetchAllNotifications')
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->NotificationCard.vue
				<template>
				    <div :class="notificationClass">
				        <div @click="dispatchMarkAsRead" class="flex justify-between items-center">
				            <img class="w-12 h-12 object-cover rounded-full" :src="'/storage/' + notification.user.profile_image.path" alt="Profile Image">

				            <div class="flex-auto mx-2">
				                <p class="h-8 overflow-y-hidden text-xs font-normal text-gray-800"><span class="font-bold text-blue-700">{{notification.user.name}}</span> {{notification.message}} "{{notification.content.body}}"</p>

				                <p class="mt-1 text-xs text-gray-500">
				                    <i v-if="notification.type=='CommentNotification'" class="fas fa-comment-alt text-green-500"></i>
				                    <i v-if="notification.type=='FriendNotification'" class="fas fa-user-check text-gray-700"></i>
				                    <i v-if="notification.type=='LikeNotification'" class="fas fa-thumbs-up text-blue-500"></i>
				                    <i v-if="notification.type=='ShareNotification'" class="fas fa-retweet text-gray-500"></i>

				                    {{notification.created_at}}
				                </p>
				            </div>
				        </div>

				        <div v-if="notification.content == 'sent'" class="flex ml-12 mt-2 text-xs">
				            <button @click="acceptFriendRequest" class="ml-2 py-1 px-3 bg-blue-700 mr-2 shadow-xl border text-white font-semibold">
				                <i class="fas fa-user-check"></i> Accept
				            </button>

				            <button @click="deleteFriendRequest" class="py-1 px-3 bg-white mr-2 shadow-xl text-gray-800 border border-gray-400 font-semibold">
				                <i class="fas fa-user-times"></i> Delete
				            </button>
				        </div>
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "NotificationCard",

				        props: ['notification'],

				        computed: {
				            ...mapGetters({
				                unreadNotifications: 'unreadNotifications',
				            }),

				            notificationMode: {
				                get() {
				                    return this.$store.getters.notificationMode;
				                },
				                set(notificationMode) {
				                    return this.$store.commit('setNotificationMode', notificationMode);
				                }
				            },

				            notificationClass() {
				                var i, unreadNotificationsIDs = []

				                for (i = 0; i < this.unreadNotifications.length; i++) {
				                    unreadNotificationsIDs.push(this.unreadNotifications[i].id)
				                }

				                if(unreadNotificationsIDs.includes(this.notification.id)) {
				                    return 'py-3 px-3 bg-gray-100 hover:bg-gray-200'
				                }
				                return 'py-3 px-3 bg-white hover:bg-gray-200'
				            }
				        },

				        methods: {
				            dispatchMarkAsRead() {
				                this.$store.dispatch('markAsRead', this.notification)
				            },

				            acceptFriendRequest() {
				                this.notification.content = ''
				                this.notification.message = ': Friend request accepted'
				                this.$store.dispatch('acceptRequest', this.notification.user.id)
				                this.$store.dispatch('hideFriendButtons', {id: this.notification.id, content: 'accepted', message: ': Friend request is accepted'})
				            },

				            deleteFriendRequest() {
				                this.notification.content = ''
				                this.notification.message = ': Friend request deleted'
				                this.$store.dispatch('deleteRequest', this.notification.user.id)
				                this.$store.dispatch('hideFriendButtons', {id: this.notification.id, content: 'deleted', message: ': Friend request is deleted'})
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->SearchBlock.vue
				<template>
				    <div class="relative">
				        <div class="absolute mx-2 text-xl text-gray-600"><i class="fas fa-search"></i></div>

				        <input @input="dispatchSearchUsers" v-model="searchTerm" @focus="searchMode = true" type="text" class="w-56 h-8 pl-10 text-sm rounded-full bg-gray-200 focus:outline-none focus:outline-none" placeholder="Search...">

				        <div v-if="searchMode" @click="searchMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				        <div v-if="searchMode" class="absolute bg-white w-56 mt-2 text-xs shadow-2xl z-20 border border-gray-300">
				            <div v-if="searchResult.length == 0" class="p-2">No Result found for '{{searchTerm}}'</div>

				            <div v-for="user in searchResult" :key='user.id' @click="searchMode = false, searchTerm = ''">
				                <router-link :to="'/users/' + user.id" class="flex items-center p-2 border-b border-gray-200 hover:bg-gray-100">
				                    <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + user.profile_image.path" alt="Profile Image">

				                    <p class="mx-2 text-blue-700 font-semibold">{{user.name}}</p>
				                </router-link>
				            </div>

				            <p class="bg-gray-100 p-1 text-center font-medium text-blue-700 border-t border-gray-300">See more users</p>
				        </div>
				    </div>
				</template/>

				<script>
				    import _ from 'lodash';
				    import {mapGetters} from "vuex";

				    export default {
				        name: "SearchBlock",

				        computed: {
				            ...mapGetters({
				                searchResult: 'searchResult',
				            })
				        },

				        data() {
				            return {
				                searchTerm: '',
				                searchMode: false
				            }
				        },

				        methods: {
				            dispatchSearchUsers: _.debounce(function (e) {
				                if(this.searchTerm.length < 2) {
				                    return
				                }

				                this.$store.dispatch('fetchSearchResult', this.searchTerm)
				            }, 500)
				        }
				    }
				</script>

				<style scoped>

				</style>


		[7.3.5] Comment
			#resources->js->components->Comment->CreateComment.vue
				<template>
				    <div class="relative flex border-t border-gray-400 p-4 py-2">
				        <input v-model='body' @input="checkTags(body)" type="text" name="comment" placeholder="Add your comment..." class="w-full pl-4 h-8 bg-gray-200 rounded-lg focus:outline-none">

				        <div v-if="tagMode" @click="tagMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				        <div v-if="tagMode" class="absolute bg-white w-56 mt-8 top-0 text-xs shadow-2xl z-20 border border-gray-300">
				            <div v-for="user in searchResult" :key='user.id'>
				                <button @click="tagUser(user.name), tagMode = false" class="flex w-full items-center p-2 text-gray-800 font-semibold border-b border-gray-200 hover:bg-blue-700 hover:text-white">
				                    <img class="w-8 h-8 object-cover" :src="'/storage/' + user.profile_image.path" alt="Profile Image">

				                    <p class="mx-2">{{user.name}}</p>
				                </button>
				            </div>
				        </div>

				        <button v-if="body" @click="dispatchAddComment(body, post_id, post_index), body = ''"  class="bg-gray-200 ml-2 px-2 py-1 rounded-lg focus:outline-none">Post</button>

				        <button ref="commentGif" class="dz-clickable mx-2 w-8 h-8 rounded-full text-xl bg-gray-200 focus:outline-none">
				            <p class="dz-clickable"><i class="fas fa-camera"></i></p>
				        </button>
				    </div>
				</template>

				<script>
				    import Dropzone from 'dropzone';
				    import {mapGetters} from "vuex";

				    export default {
				        name: "CreateComment",

				        props: ['post_id', 'post_index'],

				        data() {
				            return {
				                body: '',
				                dropzone: null,
				                tagMode: false,
				                hasTag: false
				            }
				        },

				        mounted() {
				            this.dropzone = new Dropzone(this.$refs.commentGif, this.settings);
				        },

				        computed: {
				            ...mapGetters({
				                searchResult: 'searchResult',
				            }),

				            settings() {
				                return {
				                    paramName: 'gif', // field name is image
				                    url: '/api/upload-gif',
				                    acceptedFiles: 'image/*',
				                    clickable: '.dz-clickable', // <i> will not work as it is not a button. To make sure all the inner elements of button are clickable.
				                    autoProcessQueue: true, // True because we do not want to wait till post button. The comment should be added once the image is uploaded.
				                    maxFiles: 1,
				                    parallelUploads: 1,
				                    uploadMultiple: false,
				                    params: { //Cannot pass body here because settings() load when the component is mounted. Use sending.
				                        'width': 150,
				                        'height': 150,
				                    },
				                    headers: {
				                        //'X-CSRF-TOKEN': document.head.querySelector('meta[name=csrf-token]').content, (For api, when token is not needed)

				                        'Authorization': `Bearer ${localStorage.getItem('token')}`
				                    },
				                    sending: (file, xhr, postForm) => {
				                        postForm.append('body', this.body)
				                        postForm.append('post_id', this.post_id)
				                    },
				                    success: (e, res) => {
				                        this.dropzone.removeAllFiles()

				                        this.$store.commit('pushComment', {post_index: this.post_index, comment: res.data})

				                        this.body = ''
				                    },
				                    maxfilesexceeded: file => {
				                        this.dropzone.removeAllFiles()

				                        this.dropzone.addFile(file)
				                    }
				                }
				            }
				        },

				        methods: {
				            dispatchAddComment(body, post_id, post_index) {
				                this.$store.dispatch('createComment', {body, post_id, post_index})
				            },

				            checkTags(body) {
				                if(body.includes('@') && ! this.hasTag) { //Because we are allowing to use @ only once. Only dispatch result if @ doesn't exist at all.
				                    let index = body.indexOf('@')
				                    let searchTerm = body.substring(index + 1, index + 2)

				                    this.tagMode = true
				                    this.$store.dispatch('fetchSearchResult', searchTerm)
				                }
				            },

				            tagUser(name) { //I can pass body from the top as well but then I will have to creat 2 different buttons for editMode true and false which why this is another way to make <template> code look simple
				                if(this.editMode) {
				                    this.post.body = this.post.body.replace('@', `@${name} `)
				                } else {
				                    this.body = this.body.replace('@', `@${name} `)
				                }
				                this.tagMode = false
				                this.hasTag = true
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>


		[7.3.6] User
			#resources->js->components->User->ShowUser.vue
				<template>
				    <div v-if="user">
				        <div class="bg-white">
				            <div class="relative flex justify-center mx-32">
				                <div class="w-100 h-64 overflow-hidden z-10 rounded-lg">
				                    <UploadAvatar :newAvatar="user.cover_image" avatarClass="object-cover w-full" avatarAlt="Cover Image" avatarWidth="1500" avatarHeight="500" avatarType="cover"/>
				                </div>

				                <div class="absolute bottom-0 -mb-3 z-20">
				                    <UploadAvatar :newAvatar="user.profile_image" avatarClass="w-32 h-32 object-cover rounded-full shadow-lg border-2 border-gray-200" avatarAlt="Profile Image" avatarWidth="750" avatarHeight="750" avatarType="profile" />
				                </div>

				                <div class="absolute flex items-center bottom-0 right-0 mb-4 z-20 mx-4">
				                    <button v-if="friendButton && friendButton !== 'Accept'" @click="sendFriendRequest" class="py-1 px-3 bg-gray-400 text-sm text-gray-900 font-semibold rounded">
				                        <i class="fas fa-user-plus"></i> {{friendButton}}
				                    </button>

				                    <button v-if="friendButton && friendButton === 'Accept'" @click="acceptFriendRequest" class="py-1 px-3 bg-blue-500 text-sm text-gray-900 font-semibold mr-2 rounded">
				                        <i class="fas fa-user-check"></i> Accept
				                    </button>

				                    <button v-if="friendButton && friendButton === 'Accept'" @click="deleteFriendRequest" class="py-1 px-3 bg-gray-400 text-sm text-gray-900 font-semibold mr-2 rounded">
				                        <i class="fas fa-user-times"></i> Delete
				                    </button>
				                </div>
				            </div>

				            <div class="mx-36 py-4 border-b-2 border-gray-400">
				                <p class="mb-4 text-2xl text-gray-800 font-bold text-center">{{user.name}}</p>

				                <p class="text-sm text-gray-600 font-semibold text-center">{{user.about}}</p>
				            </div>

				            <div class="mx-36 flex justify-between items-center">
				                <div class="flex items-center h-full">
				                    <button class="text-sm text-blue-600 font-bold px-2 py-3 border-b-2 border-blue-600">Timeline</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">About</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">Albums</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">Friends</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">More <i class="fas fa-caret-down"></i></button>
				                </div>

				                <div class="flex">
				                    <button v-if="user.id == authUser.id" class="text-sm text-gray-700 font-bold my-2 mx-1 py-1 px-4 bg-gray-200 rounded-lg"><i class="fas fa-edit mr-2"></i>Edit Profile</button>
				                    <button v-else class="text-sm text-gray-800 font-bold my-2 mx-1 py-1 px-4 bg-gray-200 rounded-lg shadow"><i class="fas fa-user-friends mr-2"></i>Friends <i class="fas fa-caret-down"></i></button>
				                    <button class="text-sm text-gray-800 font-bold my-2 mx-1 py-1 px-4 bg-gray-200 rounded-lg shadow"><i class="fab fa-facebook-messenger"></i></button>
				                    <button class="text-sm text-gray-800 font-bold my-2 ml-1 py-1 px-4 bg-gray-200 rounded-lg shadow"><i class="fas fa-ellipsis-h"></i></button>
				                </div>
				            </div>
				        </div>

				        <div class="flex mx-36">
				            <div class="w-5/12 flex flex-col items-center my-4 mr-2">
				                <div class="w-full rounded bg-white p-4 my-4 shadow">
				                    <p class="text-md font-bold text-gray-900">About</p>

				                    <p class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-map-marker-alt mr-2"></i>Lives in <span class="text-gray-800 font-bold">{{user.city}}</span></p>
				                    <p class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-birthday-cake mr-2"></i>Birthday on <span class="text-gray-800 font-bold">{{user.birthday.day}}/{{user.birthday.month}}/{{user.birthday.year}}</span></p>
				                    <p class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-heart mr-2"></i>Interested in <span class="text-gray-800 font-bold">{{user.interest}}</span></p>
				                    <p v-if="user.gender == 'male'" class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-mars mr-2"></i>Male</p>
				                    <p v-else class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-venus mr-2"></i>Female</p>

				                    <div class="flex justify-center my-2">
				                        <button class="w-full p-1 text-sm font-bold text-gray-800 bg-gray-200 text-center shadow">See More About {{user.name}}</button>
				                    </div>
				                </div>

				                <div class="w-full rounded bg-white p-4 shadow">
				                    <div class="flex justify-between">
				                        <p class="text-md font-bold text-gray-900">Photos</p>
				                        <button @click="seeAllMode = ! seeAllMode" class="text-md font-medium text-blue-600">See All</button>
				                    </div>

				                    <div class="flex flex-wrap justify-between">
				                        <img v-if="! seeAllMode" v-for="avatar in avatars.slice(0, 4)" :key="avatar.id" class="w-35 h-35 my-1 object-cover" :src="'/storage/' + avatar.path" alt="Profile Image">
				                        <img v-if="seeAllMode" v-for="avatar in avatars" :key="avatar.id" class="w-35 h-35 my-1 object-cover" :src="'/storage/' + avatar.path" alt="Profile Image">
				                    </div>

				                    <div class="flex justify-center my-2">
				                        <button class="w-full p-1 text-sm font-bold text-gray-800 bg-gray-200 text-center shadow">See More About {{user.name}}</button>
				                    </div>
				                </div>
				            </div>

				            <div class="w-7/12 flex flex-col items-center py-4 ml-2">
				                <CreatePost :type="'profile'" :friend_id="user.id" class="w-full mt-4" />

				                <p v-if="status.posts == 'loading' && posts.length < 1">Loading Posts...</p>

				                <PostCard class="w-full" v-else v-for="(post, index) in posts" :key="index" :post="post"/>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import PostCard from "../Extra/PostCard";
				    import UploadAvatar from "../Extra/UploadAvatar";
				    import { mapGetters } from 'vuex'
				    import CreatePost from "../Post/CreatePost";

				    export default {
				        name: "ShowUser",

				        components: {CreatePost, PostCard, UploadAvatar},

				        computed: {
				            ...mapGetters({
				                user: 'user',
				                authUser: 'authUser',
				                avatars: 'avatars',
				                posts: 'posts',
				                friendButton: 'friendButton',
				                userErrors: 'userErrors',
				                status: 'status',
				            })
				        },

				        data() {
				            return {
				                seeAllMode: false
				            }
				        },

				        created() {
				            this.$store.dispatch('fetchUser', this.$route.params.userId)
				            this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
				            this.$store.dispatch('fetchAllAvatars', this.$route.params.userId)
				        },

				        methods: {
				            sendFriendRequest() {
				                this.$store.dispatch('sendRequest', this.$route.params.userId)
				            },

				            acceptFriendRequest() {
				                this.$store.dispatch('acceptRequest', this.$route.params.userId)
				            },

				            deleteFriendRequest() {
				                this.$store.dispatch('deleteRequest', this.$route.params.userId)
				            }
				        },

				        watch:{
				            $route (to, from){
				                this.$store.dispatch('fetchUser', this.$route.params.userId)
				                this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->User->EditUser.vue
				<template>
				    <div>
				        <div class="w-full bg-white border-b-2 border-gray-400 shadow-sm">
				            <p class="p-6 text-xl font-semibold text-gray-800">{{originalName}} <i class="fas fa-caret-right mx-2 text-gray-500"></i> Edit Profile</p>
				        </div>

				        <div class="p-4">
				            <div class="flex text-center justify-center items-center">
				                <UploadAvatar :newAvatar="authUser.profile_image" avatarClass="w-32 h-32 object-cover rounded-full shadow-lg border-4 border-gray-200" avatarAlt="Profile Image" avatarWidth="750" avatarHeight="750" avatarType="profile" />
				            </div>

				            <div class="w-full px-4 py-4 text-gray-600 font-bold text-sm">
				                <div class="flex items-center py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">Name:</label>

				                    <input v-model="authUser.name" class="w-3/6 h-8 px-2 appearance-none border border-gray-400 text-gray-800 text-sm shadow focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a title">
				                </div>

				                <div class="flex items-center py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">Email Address:</label>

				                    <input v-model="authUser.email" class="w-3/6 h-8 px-2 appearance-none border border-gray-400 text-gray-800 text-sm shadow focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a title">
				                </div>

				                <div class="flex items-center py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">Current City:</label>

				                    <input v-model="authUser.city" class="w-3/6 h-8 px-2 appearance-none border border-gray-400 text-gray-800 text-sm shadow focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a title">
				                </div>

				                <div class="flex py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">I Am:</label>

				                    <div class="w-3/6 mr-4">
				                        <div class="flex items-center">
				                            <input v-model='authUser.gender' type="radio" id="male" name="gender" value="male">
				                            <label for="male" class="ml-1">Male</label>
				                        </div>

				                        <div class="flex items-center">
				                            <input v-model='authUser.gender' type="radio" id="female" name="gender" value="female">
				                            <label for="female" class="ml-1">Female</label>
				                        </div>
				                    </div>

				                    <div class="flex items-center">
				                        <input type="checkbox" class="form-checkbox h-4 w-4" checked>
				                        <label class="w-max ml-1 text-left">Show my sex in my profile</label>
				                    </div>
				                </div>

				                <div class="flex py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">Birthday:</label>

				                    <div class="w-3/6 mr-4">
				                        <div class="flex">
				                            <div class="flex-col justify-start items-center mr-4">
				                                <div class="inline-block relative">
				                                    <select v-model="authUser.birthday.day" class="block w-12 h-6 px-2 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                                        <option v-for="i in 31">{{i}}</option>
				                                    </select>

				                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                                        <i class="fas fa-caret-down"></i>
				                                    </div>
				                                </div>
				                            </div>

				                            <div class="flex-col justify-start items-center mr-4">
				                                <div class="inline-block relative">
				                                    <select v-model="authUser.birthday.month" class="block w-16 h-6 px-2 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                                        <option v-for="(month, index) in months" :value="index + 1">{{month}}</option>
				                                    </select>

				                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                                        <i class="fas fa-caret-down"></i>
				                                    </div>
				                                </div>
				                            </div>

				                            <div class="flex-col justify-start items-center mr-4">
				                                <div class="inline-block relative">
				                                    <select v-model="authUser.birthday.year" class="block w-16 h-6 px-2 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                                        <option v-for="i in 2020" v-if="i > 1995">{{i}}</option>
				                                    </select>

				                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                                        <i class="fas fa-caret-down"></i>
				                                    </div>
				                                </div>
				                            </div>
				                        </div>
				                    </div>

				                    <div class="inline-block relative">
				                        <select class="block w-max h-6 pl-2 pr-6 appearance-none bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 shadow leading-tight focus:outline-none focus:shadow-outline">
				                            <option>Show my birthday to my friends only</option>
				                            <option>Female</option>
				                        </select>

				                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                            <i class="fas fa-caret-down"></i>
				                        </div>
				                    </div>
				                </div>

				                <div class="flex items-center py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">Interested In:</label>

				                    <div class="w-3/6 flex mr-4">
				                        <div class="flex items-center mr-4">
				                            <input v-model='interested_in' type="checkbox" value="male" class="form-checkbox h-4 w-4">
				                            <span class="ml-1">Male</span>
				                        </div>

				                        <div class="flex items-center">
				                            <input v-model='interested_in' type="checkbox" value="female" class="form-checkbox h-4 w-4">
				                            <span class="ml-1">Female</span>
				                        </div>
				                    </div>
				                </div>

				                <div class="flex py-6 border-b border-gray-400">
				                    <label class="w-1/6 text-right mr-4">About Me:</label>

				                    <textarea v-model="authUser.about" rows="5" class="w-3/6 px-2 appearance-none border border-gray-400 text-gray-800 text-sm shadow focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a title"></textarea>
				                </div>

				                <div class="flex justify-end py-6">
				                    <button @click="dispatchUpdateUser(authUser)" class="px-2 py-1 mr-2 bg-blue-700 text-white text-sm font-semibold shadow-md focus:outline-none" type="button">Save</button>

				                    <button @click="$router.push('/')" class="px-2 py-1 mr-2 bg-gray-200 text-gray-600 text-sm font-semibold shadow-md border border-gray-400 focus:outline-none" type="button">Cancel</button>
				                </div>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";
				    import UploadAvatar from "../Extra/UploadAvatar";
				    import auth from "../../store/modules/auth";

				    export default {
				        name: "EditUser",

				        components: {UploadAvatar},

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				            }),
				        },

				        data() {
				            return {
				                interested_in: [],
				                originalName: null,
				                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				                originalMonth: null
				            }
				        },

				        created() {
				            if (this.authUser.interest != 'both') {
				                this.interested_in.push(this.authUser.interest)
				            } else {
				                this.interested_in.push('male', 'female')
				            }

				            //Because we don't want to change the title while changing the value in the input field unless it's saved
				            this.originalName = this.authUser.name
				        },

				        methods: {
				            dispatchUpdateUser(authUser) {
				                if (this.interested_in.length > 1 ) {
				                    authUser.interest = 'both'
				                } else {
				                    authUser.interest = this.interested_in[0]
				                }

				                this.$store.dispatch('updateUser', authUser)
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>


		[7.3.7] Item
			#resources->js->components->Item->CreateItem.vue
				<template>
				    <div class="flex relative justify-center items-center">
				        <div class="flex-col w-full h-max mx-12 my-4 bg-white shadow">
				            <div class="flex justify-between items-center m-4">
				                <div class="flex">
				                    <input type="text" class="w-56 h-8 pl-4 text-sm bg-white border border-r-0 border-gray-300 shadow-sm focus:outline-none" placeholder="Enter Product Name">

				                    <div class="relative flex items-center">
				                        <div class="absolute ml-4 text-sm text-gray-400"><i class="fas fa-map-marker-alt"></i></div>
				                        <input type="text" class="w-56 h-8 pl-8 text-sm bg-white border border-gray-300 shadow-sm focus:outline-none" placeholder="Search Location">
				                    </div>

				                    <button class="w-8 h-8 bg-gray-300 text-gray-600 shadow-sm focus:outline-none"><i class="fas fa-search"></i></button>
				                </div>

				                <div>
				                    <button ref="itemImage" class="w-96 h-8 pr-4 bg-blue-700 text-white text-sm font-semibold focus:outline-none">
				                        <i class="fas fa-plus text-xs font-light"></i> Sell Item
				                    </button>
				                </div>
				            </div>

				            <div v-if="!sellMode" class="mx-4 my-4 text-xs">
				                <div class="inline-block relative mr-4">
				                    <select class="block appearance-none w-max bg-gray-200 font-bold text-gray-700 border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none">
				                        <option>Location</option>
				                    </select>

				                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                        <i class="fas fa-caret-down"></i>
				                    </div>
				                </div>

				                <div class="inline-block relative mr-4">
				                    <select class="block appearance-none w-max bg-gray-200 font-bold text-gray-700 border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none">
				                        <option>Price</option>
				                    </select>

				                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                        <i class="fas fa-caret-down"></i>
				                    </div>
				                </div>

				                <button class="mr-4 w-max bg-gray-200 font-bold text-gray-700 border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none"><i class="fas fa-bolt mr-3"></i>Free</button>

				                <button class="font-bold text-blue-800">Reset</button>
				            </div>

				            <div v-else class="w-full px-4 py-4">
				                <div class="flex-col mb-6">
				                    <label class="text-gray-600 font-semibold text-xs">Title</label>

				                    <input v-model="itemForm.title" class="appearance-none border-b border-gray-400 w-full text-gray-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a title">
				                </div>

				                <div class="flex-col justify-start items-center mb-6">
				                    <label class="text-gray-600 font-semibold text-xs">Description</label>

				                    <input v-model="itemForm.description" class="appearance-none border-b border-gray-400 w-full text-gray-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500" placeholder="Add a description of the item">
				                </div>

				                <div class="flex-col justify-start items-center mb-6">
				                    <label class="text-gray-600 font-semibold text-xs">Price</label>

				                    <input v-model="itemForm.price" class="appearance-none border-b border-gray-400 w-full text-gray-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500" placeholder="$0.0">
				                </div>

				                <div class="flex-col justify-start items-center mb-6">
				                    <label class="text-gray-600 font-semibold text-xs mr-4">Category</label>

				                    <div class="inline-block relative w-64">
				                        <select v-model="itemForm.category_id" class="block appearance-none w-full bg-white text-gray-800 text-sm border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
				                            <option>Please select one</option>
				                            <option v-for="category in categories" :value="category.id">{{category.name}}</option>
				                        </select>

				                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				                            <i class="fas fa-caret-down"></i>
				                        </div>
				                    </div>
				                </div>

				                <div class="flex justify-end">
				                    <button @click="addItem(itemForm)" class="px-2 py-1 mr-2 bg-blue-700 text-white text-sm font-semibold shadow-md focus:outline-none" type="button">Upload</button>

				                    <button @click="cancelItem" class="px-2 py-1 mr-2 bg-gray-200 text-gray-600 text-sm font-semibold shadow-md border border-gray-400 focus:outline-none" type="button">Cancel</button>
				                </div>
				            </div>

				            <div class="dropzone-previews flex">
				                <div id="dz-template" class="hidden">
				                    <div class="dz-preview dz-file-preview mt-4">
				                        <div class="dz-details mr-1">
				                            <img data-dz-thumbnail class="w-32 h-32" alt="">

				                            <button data-dz-remove class="mt-2 ml-6 text-sm focus:outline-none"> <i class="fas fa-minus-circle text-red-500"></i> Remove</button>
				                        </div>

				                        <div class="dz-progress">
				                            <span class="dz-upload" data-dz-upload></span>
				                        </div>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>
				</template/>

				<script>
				    import Dropzone from "dropzone";
				    import {mapGetters} from "vuex";

				    export default {
				        name: "CreateItem",

				        data() {
				            return {
				                itemForm: {
				                    title: '',
				                    description: '',
				                    price: '',
				                    category_id: 'Please select one' //This needs to be exactly the same as the image first option tag with without loop
				                },
				                sellMode: false,
				                dropzone: null
				            }
				        },

				        mounted() {
				            this.dropzone = new Dropzone(this.$refs.itemImage, this.settings);
				        },

				        computed: {
				            ...mapGetters({
				                categories: 'categories'
				            }),

				            settings() {
				                return {
				                    paramName: 'image', //field name is image
				                    url: '/api/upload-images',
				                    acceptedFiles: 'image/*',
				                    autoProcessQueue: false, //When the image is uploaded, it sends it right away which will give the error becasue we do not have the body in params.
				                    previewsContainer: ".dropzone-previews",
				                    previewTemplate: document.querySelector('#dz-template').innerHTML,
				                    maxFiles: 5,
				                    parallelUploads: 5,
				                    uploadMultiple: true,
				                    params: { //Cannot pass body here because settings() load when the component is mounted. Use sending.
				                        'width': 750,
				                        'height': 750,
				                    },
				                    headers: {
				                        //'X-CSRF-TOKEN': document.head.querySelector('meta[name=csrf-token]').content, (For api, when token is not needed)

				                        'Authorization': `Bearer ${localStorage.getItem('token')}`
				                    },
				                    sending: (file, xhr, itemForm) => {
				                        itemForm.append('title', this.itemForm.title)
				                        itemForm.append('description', this.itemForm.description)
				                        itemForm.append('price', this.itemForm.price)
				                        itemForm.append('category_id', this.itemForm.category_id)
				                    },
				                    success: (e, res) => {
				                        this.dropzone.removeAllFiles()

				                        this.$store.dispatch('fetchAllItems')
				                    },
				                    maxfilesexceeded: file => {
				                        this.dropzone.removeAllFiles()

				                        this.dropzone.addFile(file)
				                    }
				                }
				            },
				        },

				        created() {
				            this.$store.dispatch('fetchAllCategories')
				        },

				        methods: {
				            addItem() {
				                this.dropzone.processQueue()
				                this.itemForm = ''
				                this.createMode = false
				            },

				            cancelItem() {
				                this.dropzone.removeAllFiles()
				                this.itemForm = ''
				                this.createMode = false
				            },
				        },

				        watch: {
				            'dropzone.files.length'(newValue, oldValue) {
				                if(newValue > 0) {
				                    this.sellMode = true
				                } else {
				                    this.sellMode = false
				                }
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Item->ShowItem.vue
				<template>
				    <ItemDetailCard :item="item" />
				</template>

				<script>
				    import ItemDetailCard from "../Extra/ItemDetailCard";
				    import {mapGetters} from "vuex";

				    export default {
				        name: "ShowItem",

				        components: {ItemDetailCard},

				        mounted() {
				            this.$store.dispatch('showItem', this.$route.params.itemId)
				        },

				        computed: {
				            ...mapGetters({
				                item: 'item',
				                status: 'itemStatus'
				            }),
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Item->ShowItems.vue
				<template>
				    <div>
				        <CreateItem />

				        <p v-if="status == 'loading'">Loading Items...</p>

				        <div v-else class="flex flex-wrap w-full justify-start items-center mx-12 my-4">
				            <div v-for="(item, index) in items" :key="index">
				                <ItemCard v-if="$route.path == '/items'" :item="item" :index="index" />

				                <ItemCard v-if="$route.path == '/category1items' && item.category_id == 1" :item="item" />
				                <ItemCard v-if="$route.path == '/category2items' && item.category_id == 2" :item="item" />
				                <ItemCard v-if="$route.path == '/category3items' && item.category_id == 3" :item="item" />
				                <ItemCard v-if="$route.path == '/category4items' && item.category_id == 4" :item="item" />
				                <ItemCard v-if="$route.path == '/category5items' && item.category_id == 5" :item="item" />
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";
				    import CreateItem from "./CreateItem";
				    import ItemCard from "../Extra/ItemCard";

				    export default {
				        name: "ShowItems",

				        components: {CreateItem, ItemCard},

				        computed: {
				            ...mapGetters({
				                items: 'items',
				                status: 'itemStatus'
				            })
				        },

				        created() {
				            this.$store.dispatch('fetchAllItems');
				        }
				    }
				</script>

				<style scoped>

				</style>


		[7.3.8] Features
			#resources->js->components->Item->ShowFeatures.vue
				<template>
				    <div class="w-4/12 mr-1 ">
				        <BirthdayFeature />
				    </div>
				</template>

				<script>
				    import BirthdayFeature from "../Extra/BirthdayFeature";

				    export default {
				        name: "ShowFeatures",

				        components: {BirthdayFeature},
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Item->ShowBirthdays.vue
				<template>
				    <div class="flex">
				        <div class="flex flex-col w-8/12 items-center">
				            <BirthdayBlock :birthdays="birthdays.today" title="Today's Birthdays" :current_date="current_date"  />
				            <BirthdayBlock :birthdays="birthdays.week" title="This Week's Birthdays" />
				            <BirthdayBlock :birthdays="birthdays.month" title="This Month's Birthdays" />
				        </div>

				        <ShowFeatures />
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";
				    import ShowFeatures from "./ShowFeatures";
				    import BirthdayBlock from "../Extra/BirthdayBlock";

				    export default {
				        name: "ShowBirthdays",

				        components: {BirthdayBlock, ShowFeatures},

				        computed: {
				            ...mapGetters({
				                birthdays: 'birthdays',
				            })
				        },

				        data() {
				            return {
				                current_date: new Date().toString().slice(4,15),
				            }
				        },

				        created() {
				            this.$store.dispatch('fetchAllBirthdays');
				        }
				    }
				</script>

				<style scoped>

				</style>



8) Socialite //Documentation is pretty simple. It works easily fif only laravel is used but as we have used front-end, it ahs been a little tricky. Follow Downloaded Tutorials or Laravel Doc.
	composer require laravel/socialite

	[8.1] Add Git and Google button on login.vue
		#resources->js->components->Auth->Login
			<template>
			    <div class="flex h-screen items-center justify-center">
			        <div class="w-full max-w-xs">
			            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
			                <div class="mb-4">
			                    <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>

			                    <input v-model="loginForm.email" class="mb-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">

			                    <p v-if="authErrors && authErrors.meta.email" class="text-red-500 text-xs italic">{{authErrors.meta.email[0]}}</p>
			                </div>

			                <div class="mb-4">
			                    <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>

			                    <input v-model="loginForm.password" class="mb-3 shadow appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">

			                    <p v-if="authErrors && authErrors.meta.password" class="text-red-500 text-xs italic">{{authErrors.meta.password[0]}}</p>
			                </div>

			                <p v-if="authErrors && authErrors.meta.unauthorised" class="mb-4 text-red-500 text-xs italic">{{authErrors.meta.unauthorised}}</p>

			                <div class="flex items-center justify-between mb-4">
			                    <button @click="dispatchLogin(loginForm)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none">Log In</button>

			                    <a @click="changeRegisterMode" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Click Here To Register!</a>
			                </div>

			                <div class="flex items-center justify-end text-xl">
			                    <a href="api/login/github" ><i class="fab fa-github mx-2"></i></a>
			                    <a href="api/login/google" ><i class="fab fa-google ml-2 text-green-600"></i></a>
			                </div>
			            </form>
			        </div>
			    </div>
			</template/>

			<script>
			    import { mapGetters } from 'vuex';

			    export default {
			        name: "Login",

			        props: ['title'],

			        data() {
			            return {
			                loginForm: {
			                    email: '',
			                    password: ''
			                }
			            }
			        },

			        computed: {
			            ...mapGetters({
			                authErrors: 'authErrors'
			            })
			        },

			        methods: {
			            dispatchLogin(loginForm) {
			                this.$store.dispatch('loginUser', loginForm)
			            },

			            changeRegisterMode() {
			                EventBus.$emit('changingRegisterMode')
			            },

			        }
			    }
			</script>

			<style scoped>

			</style>


	[8.2] Register a new app on respective provider
		#Github->Setting->OAuth Apps->Register A New App

			Application Name: Facebook Plus
			Homepage URL: http://127.0.0.1:8000
			Authorization Callback URL: http://127.0.0.1:8000/login/github/redirect

			After pressing Register, It will display Client ID and Client Secret. Copy Paste them in env.

		#Same process for Google, Instagram, Twitter and many more.

	[8.3] Add Provider in the services
		#Config->services
			'github' => [
		        'client_id' => env('GITHUB_CLIENT_ID'),
		        'client_secret' => env('GITHUB_CLIENT_SECRET'),
		        'redirect' => 'http://127.0.0.1:8000/api/login/github/callback',
		    ],

		    'google' => [
		        'client_id' => env('GOOGLE_CLIENT_ID'),
		        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
		        'redirect' => 'http://127.0.0.1:8000/api/login/google/callback',
		    ],

	[8.4] Paste the copied id and secret keys in the .env
		#.env
			APP_NAME=Laravel
			APP_ENV=local
			APP_KEY=base64:hQxt8iXWf/Uri6fVe9qp1q89TInEaueIuDEflulocfY=
			APP_DEBUG=true
			APP_URL=http://localhost

			LOG_CHANNEL=stack

			DB_CONNECTION=mysql
			DB_HOST=127.0.0.1
			DB_PORT=3306
			DB_DATABASE=facebookPlus
			DB_USERNAME=root
			DB_PASSWORD=

			BROADCAST_DRIVER=log
			CACHE_DRIVER=file
			QUEUE_CONNECTION=sync
			SESSION_DRIVER=file
			SESSION_LIFETIME=120

			REDIS_HOST=127.0.0.1
			REDIS_PASSWORD=null
			REDIS_PORT=6379

			MAIL_MAILER=smtp
			MAIL_HOST=smtp.mailtrap.io
			MAIL_PORT=2525
			MAIL_USERNAME=2bbf0db70c4a74
			MAIL_PASSWORD=b95a3b148275a5
			MAIL_ENCRYPTION=tls
			MAIL_FROM_ADDRESS=admin@facebook.com
			MAIL_FROM_NAME="${APP_NAME}"

			AWS_ACCESS_KEY_ID=
			AWS_SECRET_ACCESS_KEY=
			AWS_DEFAULT_REGION=us-east-1
			AWS_BUCKET=

			PUSHER_APP_ID=
			PUSHER_APP_KEY=
			PUSHER_APP_SECRET=
			PUSHER_APP_CLUSTER=mt1

			MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
			MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

			GITHUB_CLIENT_ID=5a36980379c86875334d
			GITHUB_CLIENT_SECRET=84c3108b93b404488b7dd39fe692b444c5de8b2a

			GOOGLE_CLIENT_ID=229400347394-r4u94vmuj22p4cla4s048ua79f6rs374.apps.googleusercontent.com
			GOOGLE_CLIENT_SECRET=w-h64fBJJqHtwvKEvNgyugSp


	[8.5] Make respective routes in api
		#routes->api //We are using RMB for socialite so that we don't have to create different routes and functions for each provider.

			<?php

			use Illuminate\Http\Request;
			use Illuminate\Support\Facades\Route;

			//Every route in this file MUST have an api prefix.

			//AUTH
			Route::post('/login', 'AuthController@login');
			Route::post('/register', 'AuthController@register');
			Route::post('/me', 'AuthController@me');
			Route::post('/logout', 'AuthController@logout');
			//auth middleware in Constructor of AuthController is added. If not, I need to put me and logout routes inside the Route::middleware('auth:api') group

			//SOCIALITE
			Route::get('/login/{provider}', 'AuthController@redirectToProvider');
			Route::get('/login/{provider}/callback', 'AuthController@handleProviderCallback');

			Route::middleware('auth:api')->group(function () {
			    //CRUD
			    Route::apiResource('/posts', 'PostController');
			    Route::apiResource('/users', 'UserController');
			    Route::apiResource('/posts/{post}/comments', 'CommentController');
			    Route::apiResource('/items', 'ItemController');
			    Route::apiResource('/categories', 'CategoryController');

			    //FRIEND REQUEST
			    Route::post('/send-request', 'FriendController@sendRequest');
			    Route::post('/confirm-request', 'FriendController@confirmRequest');
			    Route::post('/delete-request', 'FriendController@deleteRequest');

			    //LIKE, FAVOURITE, BOOKMARK
			    Route::post('/posts/{post}/like-dislike', 'LikeController@likeDislike');
			    Route::post('/posts/{post}/comments/{comment}/favourite-unfavourite', 'FavouriteController@favouriteUnfavourite');
			    Route::post('/items/{item}/bookmark-unbookmark', 'BookmarkController@bookmarkUnbookmark');

			    //IMAGE
			    Route::post('/upload-avatars', 'AvatarController@uploadAvatar');
			    Route::post('/upload-pictures', 'PictureController@uploadPicture');
			    Route::post('/upload-images', 'ImageController@uploadImage');
			    Route::post('/upload-gif', 'GifController@uploadGif');

			    //SHARE
			    Route::post('/share-post', 'ShareController@sharePost');

			    //FEATURES
			    Route::post('/filter-birthdays', 'FeatureController@filterBirthdays');
			    Route::post('/wish-birthday', 'FeatureController@wishBirthday');
			});


	[8.6] Modify Auth Controller
		#app->Http->Controllers->AuthController.php //Password of the user registered via socialite user will be password and passed as a parameter from the frontend because password field can not be null according to Auth::attampt() rules. They can not be changed because of the AuthProvider and AuthenticateUser rules. To change it, its a whole different process which ain't done yet.
			<?php

			namespace App\Http\Controllers;

			use Illuminate\Http\Request;
			use App\Http\Controllers\Controller;
			use Illuminate\Support\Facades\Auth;
			use App\Http\Resources\User as UserResource;
			use App\Notifications\LoginNotification;

			use Carbon\Carbon;
			use Laravel\Socialite\Facades\Socialite;
			use Validator;
			use App\User;

			class AuthController extends Controller
			{

			    public $user;

			    public function __construct()
			    {
			        $this->middleware('auth:api', ['except' => ['login', 'register', 'redirectToProvider', 'handleProviderCallback']]);
			    }

			    public $successStatus = 200;

			    public function login()
			    {
			        $data = request()->validate([
			            'email' => 'required',
			            'password' => 'required',
			        ]);

			        if(Auth::attempt($data)) {
			            return $this->responseAfterLogin();
			        }

			        //Inner objects are created based on manual app->Exceptions->ValidationErrorException structure for best practice.
			        return response()->json(['errors' => ['meta' => ['unauthorised' => 'Incorrect Email or Password!']]], 401);
			    }

			    public function register(Request $request)
			    {
			        $data = request()->validate([
			            'name' => 'required',
			            'email' => 'required|email',
			            'city' => 'required',
			            'gender' => 'required',
			            'birthday' => 'required',
			            'interest' => 'required',
			            'about' => 'required',
			            'provider_id' => '',
			            'password' => 'required',
			            'confirm_password' => 'required|same:password',
			        ]);

			        $data['password'] = bcrypt($data['password']);

			        User::create($data);

			        return $this->login();
			    }

			    public function responseAfterLogin() {
			        $user = auth()->user();

			        $token =  $user->createToken('MyApp')->accessToken;

			        //Send Mail notification
			        $user->notify(new LoginNotification($user));

			        return response()->json([
			            'access_token' => $token,
			            'name' => auth()->user()->name
			        ]);
			    }

			    public function me()
			    {
			        $user = auth()->user();

			        return response()->json(new UserResource($user), $this->successStatus);
			    }

			    public function logout(Request $request)
			    {
			        $user = auth()->user()->token()->revoke();

			        return response()->json('Successfully logged out', $this->successStatus);
			    }

			    public function redirectToProvider($provider)
			    {
			        return Socialite::driver($provider)->stateless()->redirect(); //We have to use stateless() because we are not using Laravel's default auth system
			    }

			    public function handleProviderCallback($provider)
			    {
			        $user = Socialite::driver($provider)->stateless()->user();

			        if (User::where('email', $user->email)->first()) {
			            //If user already exists
			            return view('passSocialiteDetails', ['email' => $user->email]);
			        } else {
			            //Else register User
			            $user = User::create([
			                'name' => ($user->nickname ?? $user->name),
			                'email' => $user->email,
			                'birthday' => '1996/1/1',
			                'provider_id' => $user->id,
			                'provider_name' => $provider,
			                'password' => bcrypt('password')
			            ]);

			            return view('passSocialiteDetails', ['email' => $user->email]);
			        }
			    }
			}


	[8.7] Create a view to pass the email from controller to frontend
		#resources->views->passSocialiteDetails //Axios request won't work with redirect urls. Therefore we need to pass the respective email or git or google user to a new view and from there we can pass it to the main component <App/> and in the aap we will dispatch the login event with the respective email.
			@extends('layouts.app')

			@section('content')
			    <div>
			        <App email="{{$email}}"/>
			    </div/>
			@endsection		


	[8.8] Dispatch loginUser event from <App />
		#resources->js->components->App.vue
			<template>
			    <div>
			        <div v-if="! loggedIn">
			            <div v-if="! registerMode"> <Login /> </div>

			            <div v-else> <Register /> </div>
			        </div>

			        <div v-else> <Home /> </div>
			    </div>
			</template>

			<script>
			    import Login from "./Auth/Login";
			    import Register from "./Auth/Register";
			    import Home from "./Main/Home";

			    export default {
			        name: "App",

			        components: {Login, Register, Home},

			        data() {
			            return {
			                loggedIn: User.loggedIn(),
			                registerMode: false
			            }
			        },

			        created() {
			            this.$store.dispatch('getPageTitle', this.$route.meta.title)

			            EventBus.$on('changingRegisterMode', () => {
			                this.registerMode = ! this.registerMode
			            })

			            if (this.$attrs.email) {
			                this.$store.dispatch('loginUser', {email: this.$attrs.email, password: 'password'})
			            }
			        },

			        watch: {
			            $route(to, from) {
			                this.$store.dispatch('getPageTitle', to.meta.title)
			            }
			        }
			    }
			</script>

			<style>

			</style>


	[8.9] Add new provider fields in the database
		#database->migrations->users
			Schema::create('users', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->string('email')->unique();
	            $table->string('city')->nullable();
	            $table->string('gender')->nullable();
	            $table->timestamp('birthday'); //It's not smart to make it nullable because we are filtering birthdays. Null birthday will throw an error.
	            $table->string('interest')->nullable();
	            $table->text('about')->nullable();
	            $table->timestamp('email_verified_at')->nullable();
	            $table->string('provider_id')->nullable(); //It will be null for the user who will try to login using register form.
	            $table->string('provider_name')->nullable(); //It will be null for the user who will try to login using register form.
	            $table->string('password');
	            $table->rememberToken();
	            $table->timestamps();
	        });

	    #app->User //Add new fields in the $fillable array
	    	<?php

			namespace App;

			use Illuminate\Contracts\Auth\MustVerifyEmail;
			use Illuminate\Foundation\Auth\User as Authenticatable;
			use Illuminate\Notifications\Notifiable;
			use Laravel\Passport\HasApiTokens;

			use App\Post;
			use App\Comment;
			use App\Friend;
			use App\Avatar;
			use App\Item;
			use Carbon\Carbon;

			class User extends Authenticatable
			{
			    use Notifiable, HasApiTokens;


			    protected $fillable = [
			        'name', 'email', 'city', 'gender', 'birthday', 'interest', 'about', 'provider_id', 'provider_name', 'password',
			    ];

			    protected $dates = ['birthday'];

			    protected $hidden = [
			        'password', 'remember_token',
			    ];

			    protected $casts = [
			        'email_verified_at' => 'datetime',
			    ];

			    public function getPathAttribute()
			    {
			        return "/users/$this->id";
			    }

			    public function posts()
			    {
			        return $this->hasMany(Post::class);
			    }

			    public function comments()
			    {
			        return $this->hasMany(Comment::class);
			    }

			    public function friends()
			    {
			        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id');
			    }

			    public function likes()
			    {
			        return $this->belongsToMany(Post::class, 'likes', 'user_id', 'post_id');
			    }

			    public function images()
			    {
			        return $this->hasMany(Avatar::class);
			    }

			    public function items()
			    {
			        return $this->hasMany(Item::class);
			    }

			    public function bookmarks()
			    {
			        return $this->belongsToMany(Item::class, 'bookmarks', 'user_id', 'item_id');
			    }

			    public function coverImage()
			    {
			        return $this->hasOne(Avatar::class)
			            ->orderByDesc('id')
			            ->where('type', 'cover')
			            ->withDefault(function ($image) {
			                $image->path = 'uploadedAvatars/cover.jpg';
			                $image->width = 1500;
			                $image->height = 500;
			                $image->type = 'cover';
			            });
			    }

			    public function profileImage()
			    {
			        return $this->hasOne(Avatar::class)
			            ->orderByDesc('id')
			            ->where('type', 'profile')
			            ->withDefault(function ($image) {
			                $image->path = 'uploadedAvatars/profile.jpg';
			                $image->width = 750;
			                $image->height = 750;
			                $image->type = 'profile';
			            });
			    }

			    //While post or put request, the birthday would be a string of '27/05/2000'. It needs to be converted into Carbon date before saving into the database. That's why this inbuilt function is used.
			    public function setBirthdayAttribute($birthday)
			    {
			        $this->attributes['birthday'] = Carbon::parse($birthday);
			    }
			}



9) Notifications //Go from bottom to top to understand the flow
	[9.1] Installation & Setup
		//Make notification using Laravel documentation
		php artisan make:notification CommentNotification

		php artisan make:notification LikeNotification

		php artisan make:notification ShareNotification

		php artisan make:notification FriendNotification

		php artisan make:notification TagNotification

		php artisan notifications:table
		
		#database->migrations->notifications //It is created automatically. Just change the 'data' type to longText
			Schema::create('notifications', function (Blueprint $table) {
	            $table->uuid('id')->primary();
	            $table->string('type');
	            $table->morphs('notifiable');
	            $table->longText('data');
	            $table->timestamp('read_at')->nullable();
	            $table->timestamps();
	        });

		php artisan migrate

	[9.2] Backend Operations
		[9.2.1] Catch new comment/like... instance and return array in database //It will be stored in data field of the notification migration
			#app->Notifications->CommentNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;
				use App\Http\Resources\User as UserResource;

				use App\Comment;


				class CommentNotification extends Notification
				{
				    use Queueable;

				    //Create a new notification instance.
				    public function __construct(Comment $comment)
				    {
				        $this->comment = $comment;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    //Get the array representation of the notification.
				    public function toArray($notifiable)
				    {
				        return [
				            'user' => new UserResource($this->comment->user),
				            'content' => $this->comment->post,
				            'message' => 'commented on your post: '
				        ];
				    }
				}

			#app->Notifications->LikeNotification
				<?php

				namespace App\Notifications;

				use App\Http\Resources\User as UserResource;
				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				use App\Post;


				class LikeNotification extends Notification
				{
				    use Queueable;

				    //Create a new notification instance.
				    public function __construct(Post $post)
				    {
				        $this->post = $post;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    //Get the array representation of the notification.
				    public function toArray($notifiable)
				    {
				        return [
				            'user' => new UserResource($this->post->user),
				            'content' => $this->post,
				            'message' => 'liked your post: '
				        ];
				    }
				}

			#app->Notifications->ShareNotification
				<?php

				namespace App\Notifications;

				use App\Http\Resources\User as UserResource;
				use App\Post;
				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				class ShareNotification extends Notification
				{
				    use Queueable;

				    //Create a new notification instance.
				    public function __construct(Post $post)
				    {
				        $this->post = $post;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    //Get the array representation of the notification.
				    public function toArray($notifiable)
				    {
				        return [
				            'user' => new UserResource($this->post->user),
				            'content' => $this->post,
				            'message' => 'Shared your post: '
				        ];
				    }
				}

			#app->Notifications->FriendNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;
				use App\Http\Resources\User as UserResource;


				class FriendNotification extends Notification
				{
				    use Queueable;

				    //Create a new notification instance.
				    public function __construct($user)
				    {
				        //For now we are notifying only one user's birthday that is today. We will deal with it later in detail for more users.
				        $this->user = $user;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    //Get the array representation of the notification.
				    public function toArray($notifiable)
				    {
				        return [
				            'user' => new UserResource($this->user),
				            'content' => 'sent',
				            'message' => 'Has sent you Friend Request',
				        ];
				    }
				}

			#app->Notifications->TagNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;
				use App\Http\Resources\User as UserResource;

				use App\Post;


				class TagNotification extends Notification
				{
				    use Queueable;

				    //Create a new notification instance.
				    public function __construct($comment)
				    {
				        $this->comment = $comment;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    //Get the array representation of the notification.
				    public function toArray($notifiable)
				    {
				        return [
				            'user' => new UserResource($this->comment->user),
				            'content' => $this->comment,
				            'message' => 'Mentioned you in a comment: '
				        ];
				    }
				}

			#app->Notifications->WishNotification
				<?php

				namespace App\Notifications;

				use App\Http\Resources\User as UserResource;
				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				class WishNotification extends Notification
				{
				    //Create a new notification instance.
				    public function __construct($post)
				    {
				        $this->post = $post;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['database'];
				    }

				    //Get the array representation of the notification.
				    public function toArray($notifiable)
				    {
				        return [
				            'user' => new UserResource($this->post->user),
				            'content' => $this->post,
				            'message' => 'Wrote on your wall: '
				        ];
				    }
				}


		[9.2.2] Wrap the data in a Notification //Because created_at is outside the data{} which is the array of ReplyNotification
			php artisan make:resource Notification

			#Notification
				<?php

				namespace App\Http\Resources;

				use App\Http\Resources\User as UserResource;
				use Illuminate\Http\Resources\Json\JsonResource;

				class Notification extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'user' => $this->data['user'],
				            'content' => $this->data['content'], //Post, comment, like whatever there is.
				            'message' => $this->data['message'],
				            'type' => substr($this->type, 18),
				            'created_at' => $this->created_at->diffForHumans()
				        ];
				    }
				}

		//Notify the user by storing the notification details in the notification table when the specific actions such as like, store, share happen.
		[9.2.3] Store the notifications in the notification table 
			#CommentController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\CommentCollection;
				use App\Http\Resources\Post as PostResource;
				use App\Http\Requests\CommentRequest;
				use App\Notifications\CommentNotification;

				use App\Comment;
				use App\Post;


				class CommentController extends Controller
				{
				    public function index(Post $post)
				    {
				        return new PostResource($post);
				    }

				    public function store(CommentRequest $request, Post $post)
				    {
				        /*
				            public function store(Post $post)
				            {
				                $data = request()->validate([
				                    'body' => 'required',
				                ]);

				                $post->comments()->create(array_merge($data, ['user_id' => auth()->user()->id]));

				                return new CommentCollection($post->comments);
				            }
				        */
				        $request['user_id'] = auth()->user()->id;

				        $comment = $post->comments()->create($request->all());

				        //Send Notifications
				        $user = $post->user;

				        if($comment->user_id != $post->user_id) {
				            $user->notify(new CommentNotification($comment));
				        }

				        return new CommentCollection($post->comments);
				    }

				    public function show(Comment $comment)
				    {
				        //
				    }

				    public function update(CommentRequest $request, Post $post, Comment $comment)
				    {
				        $comment->update($request->all());

				        return new CommentCollection($post->comments);
				    }

				    public function destroy(Post $post, Comment $comment)
				    {
				        $comment->delete();

				        return response('Deleted', 204);
				    }
				}

			#LikeController
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\LikeCollection;
				use App\Notifications\LikeNotification;
				use Illuminate\Http\Request;

				use App\Post;
				use App\Like;


				class LikeController extends Controller
				{
				    public function likeDislike(Post $post)
				    {
				        //Create like
				        $post->likes()->toggle(auth()->user());

				        //Sends notification
				        $like = Like::orderby('created_at', 'desc')->first();

				        $user = $post->user;

				        if($like->user_id != $post->user_id) {
				            $user->notify(new LikeNotification($post));
				        }

				        return new LikeCollection($post->likes);
				    }
				}

			#ShareController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\Post as PostResource;
				use App\Notifications\ShareNotification;

				use Auth;
				use App\Post;


				class ShareController extends Controller
				{
				    public function sharePost(Request $request)
				    {
				        $post = Auth::user()->posts()->create([
				            'body' => $request->body,
				            'repost_id' => $request->repost_id,
				            'user_id' => Auth::user()->id
				        ]);

				        //Send Notifications
				        $shared_post = Post::find($post->repost_id);

				        $user = $shared_post->user;

				        if($post->user_id != $shared_post->user_id) {
				            $user->notify(new ShareNotification($post));
				        }

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }
				}

			#FriendController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Database\Eloquent\ModelNotFoundException;
				use App\Exceptions\UserNotFoundException;
				use App\Exceptions\RequestNotFoundException;
				use App\Exceptions\ValidationErrorException;
				use Illuminate\Validation\ValidationException;
				use App\Notifications\FriendNotification;
				use Illuminate\Http\Request;
				use \App\Http\Resources\Friend as FriendResource;

				use App\User;
				use App\Friend;
				use Auth;


				class FriendController extends Controller
				{
				    //In postman, we have to pass friend_id as we are not using RMB here.
				    public function sendRequest(Request $request)
				    {
				        $data = request()->validate([
				            'friend_id' => 'required'
				        ]);

				        /*
				            //We have to find user because here we are not using Route Model Binding.
				            //For RMB, the route would be like:
				                Route::post('/replies/{reply}/like', 'LikeController@likeIt');
				            //And the function would be like:
				                public function likeIt(Reply $reply)
				                    {
				                        $reply->likes()->create([
				                            'user_id' => auth()-> id(),
				                        ]);
				                    }
				        */
				        try {
				            $user = User::findOrFail($data['friend_id']);
				        } catch (ModelNotFoundException $e){
				            throw new UserNotFoundException();
				        }

				        /*
				            Attach is used for many to many (belongsToMany) relationship.
				            Attach will cause repeat the same values in database.
				            In the migration unique has been added which is why attach will try to add the same user_id and friend_id and it will give integrity constrain error.
				            Here, $user has the friend_if which will automatically be filled in the friends table
				        */
				        $user->friends()->syncWithoutDetaching(Auth::user());

				        /*
				            //If you want to use hasMany instead of belongsToMany you have to use create
				                $user->friends()->create([
				                    'friend_id' => $data['friend_id'], 'user_id' => auth()-> id()
				                ]);
				        */

				        $friendRequest = Friend::where('user_id', auth()->user()->id)
				            ->where('friend_id', $data['friend_id'])
				            ->first();

				        //Send notification
				        $friend = User::find($data['friend_id']);

				        $friend->notify(new FriendNotification(auth()->user()));

				        return new FriendResource($friendRequest);
				    }

				    public function confirmRequest(Request $request)
				    {
				        $data = request()->validate([
				            'user_id' => 'required',
				        ]);

				        try {
				            $friendRequest = Friend::where('user_id', $data['user_id'])
				                ->where('friend_id', auth()->user()->id)
				                ->firstOrFail();
				        } catch (ModelNotFoundException $e){
				            throw new RequestNotFoundException();
				        }

				        $friendRequest->update(array_merge($data, ['confirmed_at' => now(), 'status' => '1']));

				        return new FriendResource($friendRequest);
				    }

				    public function deleteRequest(Request $request)
				    {
				        $data = request()->validate([
				            'user_id' => 'required',
				        ]);

				        try {
				            $friendRequest = Friend::where('user_id', $data['user_id'])
				                ->where('friend_id', auth()->user()->id)
				                ->firstOrFail()
				                ->delete();
				        } catch (ModelNotFoundException $e){
				            throw new RequestNotFoundException();
				        }

				        return response()->json([], 204);
				    }
				}

			#FeatureController //For TaggedUser and Write on friend's wall (wishBirthday)
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Post as PostResource;
				use App\Notifications\BirthdayNotification;
				use App\Notifications\TagNotification;
				use App\Notifications\WishNotification;
				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;

				use Auth;
				use App\User;
				use App\Comment;
				use App\Avatar;


				class FeatureController extends Controller
				{
				    //Easy to filter birthdays of all users in front-end by passing user's birthday(d,m,y format) and current date(d,m,y format) through resource but I'm doing it here just practice queries
				    public function filterBirthdays()
				    {
				        //Today's Birthdays - Method 1
				        $today = User::where(User::raw("(DATE_FORMAT(birthday, '%d'))"), now()->format('d'))->get(); //Or use ->paginate(5);

				        //This week's Birthdays - Method 2 (Don't display today's birthdays)
				        $users =  User::all();
				        $week =[];

				        foreach ($users as $user) {
				            if($user->birthday->format('m') == now()->format('m') and in_array($user->birthday->format('d'), range(now()->format('d') + 1, now()->format('d') + 6))) {
				                array_push($week, $user);
				            }
				        }

				        //This month's Birthdays - Method 3 (Don't display today and this week's birthdays)
				        $month = User::whereRaw('birthday LIKE "%-'. now()->format('m') .'-%"' )->where(User::raw("(DATE_FORMAT(birthday, '%d'))"), ">",  now()->format('d') + 7)->get(); //Or use ->paginate(5);

				        //Won't implement because this function is called in the create() of vue which is why it will give a new notification everytime the page is refreshed. I will have to create a new function and notify the user there.
				        //Do it like notifyTaggedUser
				        /*
				            //Send notification
				            auth()->user()->notify(new BirthdayNotification($today));
				        */

				        return [
				            'today' => UserResource::collection($today),
				            'week' => UserResource::collection($week),
				            'month' => UserResource::collection($month)
				        ];
				    }

				    //Also considered as writing on other user's wall
				    public function wishBirthday(Request $request)
				    {
				        $post = Auth::user()->posts()->create([
				            'body' => $request->body,
				            'friend_id' => $request->friend_id,
				            'user_id' => Auth::user()->id
				        ]);

				        //Send notification
				        $friend = User::find($request->friend_id);
				        $friend->notify(new WishNotification($post));

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }

				    //Send notification
				    public function notifyTaggedUser(Request $request) {
				        $tagged_user_id = $request->tagged_user_id;
				        $tagged_comment_id = $request->tagged_comment_id;

				        if($tagged_user_id != null && $tagged_user_id != Auth::user()->id) {
				            $tagged_user = User::find($tagged_user_id);
				            $tagged_comment = Comment::find($tagged_comment_id);
				            $tagged_user->notify(new TagNotification($tagged_comment));
				        }
				    }

				    public function getAllAvatars(Request $request)
				    {
				        $user_id = $request->user_id;

				        $avatars = Avatar::where('user_id', $user_id)->get();

				        return $avatars;
				    }
				}


		[9.2.4] Fetch the stored notifications from notification table //It will fetch all the notifications of the auth user
			php artisan make:controller NotificationController

			#NotificationController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\Notification as NotificationResource;
				use Illuminate\Support\Facades\DB;

				class NotificationController extends Controller
				{
				    public function index()
				    {
				        return [
				            'all' => NotificationResource::collection(auth()->user()->notifications),
				            'read' => NotificationResource::collection(auth()->user()->readNotifications),
				            'unread' => NotificationResource::collection(auth()->user()->unreadNotifications)
				        ];
				    }

				    public function markAsRead(Request $request)
				    {
				        auth()->user()->notifications->where('id', $request->id)->markAsRead();
				    }

				    public function hideFriendButtons(Request $request)
				    {
				        $notification = auth()->user()->notifications->where('id', $request->id)->first();
				        $data = $notification->data;
				        $notification->update(array('data' => array_merge($data, ['content' => $request->content, 'message' => $request->message])));
				    }
				}

	
		[9.2.5] Add proper routes to call these functions
			#app->routes->api.php
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				//Every route in this file MUST have an api prefix.

				//AUTH
				Route::post('/login', 'AuthController@login');
				Route::post('/register', 'AuthController@register');
				Route::post('/me', 'AuthController@me');
				Route::post('/logout', 'AuthController@logout');
				//auth middleware in Constructor of AuthController is added. If not, I need to put me and logout routes inside the Route::middleware('auth:api') group

				//SOCIALITE
				Route::get('/login/{provider}', 'AuthController@redirectToProvider');
				Route::get('/login/{provider}/callback', 'AuthController@handleProviderCallback');

				Route::middleware('auth:api')->group(function () {
				    //CRUD
				    Route::apiResource('/posts', 'PostController');
				    Route::apiResource('/users', 'UserController');
				    Route::apiResource('/posts/{post}/comments', 'CommentController');
				    Route::apiResource('/items', 'ItemController');
				    Route::apiResource('/categories', 'CategoryController');

				    //FRIEND REQUEST
				    Route::post('/send-request', 'FriendController@sendRequest');
				    Route::post('/confirm-request', 'FriendController@confirmRequest');
				    Route::post('/delete-request', 'FriendController@deleteRequest');

				    //LIKE, FAVOURITE, BOOKMARK
				    Route::post('/posts/{post}/like-dislike', 'LikeController@likeDislike');
				    Route::post('/posts/{post}/comments/{comment}/favourite-unfavourite', 'FavouriteController@favouriteUnfavourite');
				    Route::post('/items/{item}/bookmark-unbookmark', 'BookmarkController@bookmarkUnbookmark');

				    //IMAGE
				    Route::post('/upload-avatars', 'AvatarController@uploadAvatar');
				    Route::post('/upload-pictures', 'PictureController@uploadPicture');
				    Route::post('/upload-images', 'ImageController@uploadImage');
				    Route::post('/upload-gif', 'GifController@uploadGif');

				    //SHARE
				    Route::post('/share-post', 'ShareController@sharePost');

				    //FEATURES
				    Route::post('/filter-birthdays', 'FeatureController@filterBirthdays');
				    Route::post('/wish-birthday', 'FeatureController@wishBirthday');
				    Route::post('/notify-tagged-user', 'FeatureController@notifyTaggedUser');
				    Route::post('/get-all-avatars', 'FeatureController@getAllAvatars');


				    //NOTIFICATIONS
				    Route::post('/notifications', 'NotificationController@index');
				    Route::post('/mark-as-read', 'NotificationController@markAsRead');
				    Route::post('/hide-friend-buttons', 'NotificationController@hideFriendButtons');

				    //SEARCH
				    Route::post('/search', 'SearchController@getUsers');
				});



	[9.3] Frontend Operations
		[9.3.1] Create js Module
			#resources->js->store->modules->notifications.js
				const state = {
				    notificationMode: false, //It's taken here rather than in the Vue to avoid the use of EventBus.
				    allNotifications: {},
				    readNotifications: {},
				    unreadNotifications: {},
				    unreadNotificationCount: 0,
				    notificationErrors: null
				};

				const getters = {
				    notificationMode: state => {
				        return state.notificationMode;
				    },

				    allNotifications: state => {
				        return state.allNotifications;
				    },

				    readNotifications: state => {
				        return state.readNotifications;
				    },

				    unreadNotifications: state => {
				        return state.unreadNotifications;
				    },

				    unreadNotificationCount: state => {
				        return state.unreadNotificationCount.length;
				    },

				    notificationErrors: state => {
				        return state.notificationErrors;
				    }
				};

				const actions = {
				    fetchAllNotifications({commit, state}) {
				        axios.post('/api/notifications')
				            .then(res => commit('setNotifications', res.data))
				            .catch(err => commit('setNotificationErrors', err))
				    },

				    markAsRead({commit, state}, notification) {
				        axios.post('/api/mark-as-read', {id: notification.id})
				            .then(res => commit('setMarkAsRead', notification))
				            .catch(err => commit('setBirthdayErrors', err))
				    },

				    hideFriendButtons({commit, state}, data) {
				        axios.post('/api/hide-friend-buttons', data)
				            .then(res => commit('setMarkAsRead', notification))
				            .catch(err => commit('setBirthdayErrors', err))
				    }
				};

				const mutations = {
				    setNotificationMode(state, newMode) {
				        state.notificationMode = newMode
				    },

				    setNotifications(state, notifications) {
				        state.allNotifications = notifications.all
				        state.readNotifications = notifications.read
				        state.unreadNotifications = notifications.unread
				    },

				    setMarkAsRead(state, notification) {
				        state.notificationMode = false
				        state.unreadNotifications.splice(notification, 1)
				        state.readNotifications.push(notification)
				        state.unreadNotificationCount --
				    },

				    setNotificationErrors(state, err) {
				        state.notificationErrors = err
				    },
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->index.js
				import Vue from 'vue';
				import Vuex from 'vuex';
				import Auth from './modules/auth.js'
				import Title from './modules/title.js'
				import Request from './modules/request.js'
				import Posts from './modules/posts.js'
				import Comments from './modules/comments.js'
				import Items from './modules/items.js'
				import Categories from './modules/categories.js'
				import User from './modules/user.js'
				import Features from './modules/features.js'
				import Notifications from './modules/notifications.js'

				Vue.use(Vuex);

				export default new Vuex.Store({
				    modules: {
				        Auth,
				        Title,
				        Request,
				        Posts,
				        Comments,
				        Items,
				        Categories,
				        User,
				        Features,
				        Notifications
				    }
				});

		[9.3.2] Modify Comments.js
			#resources->js->store->modules->comments.js
				import Posts from './posts'

				const state = {
				    //Unlike posts, we will pass the body from the vue file as a parameter (Just to do it differently)
				    commentErrors: null
				};

				const getters = {
				    commentErrors: state => {
				        return state.commentErrors;
				    }
				};

				const actions = {
				    createComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments', {body: data.body})
				            .then(res => {
				                commit('pushComments', {comments: res.data, post_index: data.post_index})
				                var latest_comment = res.data.data
				                axios.post('/api/notify-tagged-user', {tagged_user_id: latest_comment[0].tag.taggedUserID, tagged_comment_id: latest_comment[0].id})
				            })
				            .catch(err => commit('setCommentErrors', err))
				    },

				    updateComment({commit, state}, data) {
				        axios.put('/api/posts/' + data.post_id + '/comments/' + data.comment_id, {body: data.comment_body})
				            .then(res => {
				                commit('pushComments', {comments: res.data, post_index: data.post_index})
				                var latest_comment = res.data.data
				                axios.post('/api/notify-tagged-user', {tagged_user_id: latest_comment[0].tag.taggedUserID, tagged_comment_id: latest_comment[0].id})
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    deleteComment({commit, state}, data) {
				        axios.delete('/api/posts/' + data.post_id + '/comments/' + data.comment_id)
				            .then(res => commit('spliceComment', data))
				            .catch(err => commit('setCommentErrors', err))
				    },

				    favouriteUnfavouriteComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments/' + data.comment_id + '/favourite-unfavourite', {type: data.type})
				            .then(res => commit('pushFavourites', {favourites: res.data, post_index: data.post_index, comment_index: data.comment_index}))
				            .catch(err => commit('setCommentErrors', err))
				    }
				};

				const mutations = {
				    setCommentErrors(state, err) {
				        state.commentErrors = err.response
				    },

				    pushComments(state, data) {
				        Posts.state.posts[data.post_index].comments = data.comments
				    },

				    // This is for the GifController. Just a different way. We are pushing the newly created gif comment.
				    pushComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.unshift(data.comment)
				    },

				    spliceComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.splice(data.comment_index, 1)
				    },

				    /*
				        Here we have to change user_favourited and favourited_type change manually as they are in CommentResource and not in the FavouriteCollection unlike Likes and Bookmarks.
				        If user_favourited was in FavouriteCollection, it would've been updated by default using ID as the id field would be user_id in FavouriteResource.
				        But it is only applicable in ManyToMany. As we are using HasMany, the $this->id in collection would refer to the id of favourite table's id which is useless.
				    */
				    pushFavourites(state, data) {
				        //We need to replace favourites Only for counts.
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].favourites = data.favourites
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].user_favourited = ! Posts.state.posts[data.post_index].comments.data[data.comment_index].user_favourited
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].favourited_type = data.favourites.data[0].type
				    }
				};

				export default {
				    state, getters, actions, mutations
				}


		[9.3.3] Edit components
			#resources->js->components->Main->Navbar.vue
				<template>
				    <div class="flex justify-between items-center bg-blue-700 h-12 border-b border-gray-400 shadow-sm">
				        <div class="flex justify-start items-center">
				            <router-link to="/" class="ml-12 mr-2 text-4xl text-white">
				                <i class="fab fa-facebook"></i>
				            </router-link>

				            <div class="relative">
				                <div class="absolute mx-2 text-xl text-gray-600">
				                    <i class="fas fa-search"></i>
				                </div>
				                <input type="text" class="w-56 h-8 pl-10 text-sm rounded-full bg-gray-200 focus:outline-none focus:shadow-outline" placeholder="Search...">
				            </div>
				        </div>

				        <div class="w-full flex justify-center items-center h-full text-white">
				            <router-link to="/" :class="homeButtonClass">
				                <i class="fas fa-home"></i>
				            </router-link>

				            <router-link :to="'/users/' + authUser.id" :class="profileButtonClass">
				                <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + authUser.profile_image.path" alt="Profile Image">
				            </router-link>

				            <router-link to="/" class="flex items-center h-full px-6 text-2xl text-white border-b-2 border-blue-700 hover:border-white">
				                <i class="fab fa-facebook-messenger"></i>
				            </router-link>
				        </div>

				        <div class="w-1/3 relative flex justify-end mr-8 text-2xl">
				            <button @click="notificationMode = ! notificationMode" class="hover:text-white focus:outline-none focus:text-white"><i class="fas fa-bell mx-6"></i></button>

				            <div v-if="notificationMode" @click="notificationMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				            <div v-if="notificationMode" class="absolute right-0 w-96 mr-20 mt-10 shadow-2xl bg-white border-b border-gray-400">
				                <NotificationBlock />
				            </div>

				            <button class="hover:text-white focus:outline-none"><i class="fas fa-cog mx-6"></i></button>
				        </div>
				    </div>
				</template>

				<script>
				    import { mapGetters } from 'vuex';
				    import NotificationBlock from "../Extra/NotificationBlock";

				    export default {
				        name: "Navbar",

				        components: {NotificationBlock},

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				                title: 'title',
				            }),

				            notificationMode: {
				                get() {
				                    return this.$store.getters.notificationMode;
				                },
				                set(notificationMode) {
				                    return this.$store.commit('setNotificationMode', notificationMode);
				                }
				            },

				            homeButtonClass() {
				                if(this.title == 'NewsFeed | Facebook') {
				                    return 'flex items-center h-full px-6 text-white text-2xl border-b-2 border-white'
				                }
				                return 'flex items-center h-full px-6 text-2xl text-white border-b-2 border-blue-700 hover:border-white'
				            },

				            profileButtonClass() {
				                if(this.title == 'Profile | Facebook') {
				                    return 'flex items-center h-full px-6 text-2xl border-b-2 hover:text-white focus:outline-none'
				                }
				                return 'flex items-center h-full px-6 text-2xl border-b-2 border-blue-700 hover:border-white'
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->NotificationBlock.vue
				<template>
				    <div>
				        <div class="flex justify-between text-xs p-2 border-b border-gray-400">
				            <p class="text-gray-800 font-semibold">Notifications</p>

				            <div class="flex text-blue-700 font-medium">
				                <p class="px-4">Mark all as read</p>
				                <p>Settings</p>
				            </div>
				        </div>

				        <div class="h-80 overflow-y-scroll">
				            <div v-for="notification in allNotifications" :key="notification.id" class="border-b border-gray-300">
				                <NotificationCard :notification="notification" />
				            </div>
				        </div>

				        <div class="flex justify-center bg-gray-200 text-xs p-2">
				            <p class="text-blue-700 font-semibold">See All Notifications</p>
				        </div>
				    </div>
				</template>

				<script>
				    import NotificationCard from "./NotificationCard";
				    import {mapGetters} from "vuex";
				    export default {
				        name: "NotificationBlock",

				        components: {NotificationCard},

				        computed: {
				            ...mapGetters({
				                allNotifications: 'allNotifications',
				            }),
				        },

				        created() {
				            this.$store.dispatch('fetchAllNotifications')
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->NotificationCard.vue
				<template>
				    <div :class="notificationClass">
				        <div @click="dispatchMarkAsRead" class="flex justify-between items-center">
				            <img class="w-12 h-12 object-cover rounded-full" :src="'/storage/' + notification.user.profile_image.path" alt="Profile Image">

				            <div class="flex-auto mx-2">
				                <p class="h-8 overflow-y-hidden text-xs font-normal text-gray-800"><span class="font-bold text-blue-700">{{notification.user.name}}</span> {{notification.message}} "{{notification.content.body}}"</p>

				                <p class="mt-1 text-xs text-gray-500">
				                    <i v-if="notification.type=='CommentNotification'" class="fas fa-comment-alt text-green-500"></i>
				                    <i v-if="notification.type=='FriendNotification'" class="fas fa-user-check text-gray-700"></i>
				                    <i v-if="notification.type=='LikeNotification'" class="fas fa-thumbs-up text-blue-500"></i>
				                    <i v-if="notification.type=='ShareNotification'" class="fas fa-retweet text-gray-500"></i>

				                    {{notification.created_at}}
				                </p>
				            </div>
				        </div>

				        <div v-if="notification.content == 'sent'" class="flex ml-12 mt-2 text-xs">
				            <button @click="acceptFriendRequest" class="ml-2 py-1 px-3 bg-blue-700 mr-2 shadow-xl border text-white font-semibold">
				                <i class="fas fa-user-check"></i> Accept
				            </button>

				            <button @click="deleteFriendRequest" class="py-1 px-3 bg-white mr-2 shadow-xl text-gray-800 border border-gray-400 font-semibold">
				                <i class="fas fa-user-times"></i> Delete
				            </button>
				        </div>
				    </div>
				</template>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "NotificationCard",

				        props: ['notification'],

				        computed: {
				            ...mapGetters({
				                unreadNotifications: 'unreadNotifications',
				            }),

				            notificationMode: {
				                get() {
				                    return this.$store.getters.notificationMode;
				                },
				                set(notificationMode) {
				                    return this.$store.commit('setNotificationMode', notificationMode);
				                }
				            },

				            notificationClass() {
				                var i, unreadNotificationsIDs = []

				                for (i = 0; i < this.unreadNotifications.length; i++) {
				                    unreadNotificationsIDs.push(this.unreadNotifications[i].id)
				                }

				                if(unreadNotificationsIDs.includes(this.notification.id)) {
				                    return 'py-3 px-3 bg-gray-100 hover:bg-gray-200'
				                }
				                return 'py-3 px-3 bg-white hover:bg-gray-200'
				            }
				        },

				        methods: {
				            dispatchMarkAsRead() {
				                this.$store.dispatch('markAsRead', this.notification)
				            },

				            acceptFriendRequest() {
				                this.notification.content = ''
				                this.notification.message = ': Friend request accepted'
				                this.$store.dispatch('acceptRequest', this.notification.user.id)
				                this.$store.dispatch('hideFriendButtons', {id: this.notification.id, content: 'accepted', message: ': Friend request is accepted'})
				            },

				            deleteFriendRequest() {
				                this.notification.content = ''
				                this.notification.message = ': Friend request deleted'
				                this.$store.dispatch('deleteRequest', this.notification.user.id)
				                this.$store.dispatch('hideFriendButtons', {id: this.notification.id, content: 'deleted', message: ': Friend request is deleted'})
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

10) Mail Notifications 
	[10.1] Installation & Setup
		//Make mail notification using Laravel documentation
		php artisan make:notification LoginNotification

	[10.2] Backend Setup
		//Notify the user vue toMail magic method of the via['mail']
		[10.2.1] Catch new user instance and return new MailMessage //It will be stored in data field of the notification migration
			#app->Notifications->LoginNotification
				<?php

				namespace App\Notifications;

				use Illuminate\Bus\Queueable;
				use Illuminate\Contracts\Queue\ShouldQueue;
				use Illuminate\Notifications\Messages\MailMessage;
				use Illuminate\Notifications\Notification;

				class LoginNotification extends Notification
				{
				    use Queueable;

				    //Create a new notification instance.
				    public function __construct($user)
				    {
				        $this->user = $user;
				    }

				    //Get the notification's delivery channels.
				    public function via($notifiable)
				    {
				        return ['mail'];
				    }


				    //Get the mail representation of the notification.
				    public function toMail($notifiable)
				    {
				        return (new MailMessage)
				                    ->greeting('Hello '. $this->user->name.'!')
				                    ->line('Welcome to Facebook Plus.')
				                    ->action('Visit your profile', url('/users/'.$this->user->id))
				                    ->line('Thank you for using our application!');
				    }
				}

		[10.2.2] Notifiy the user from the respective controller
			#app->Http->Controllers->AuthController.php
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Controllers\Controller;
				use Illuminate\Support\Facades\Auth;
				use App\Http\Resources\User as UserResource;
				use App\Notifications\LoginNotification;

				use Carbon\Carbon;
				use Laravel\Socialite\Facades\Socialite;
				use Validator;
				use App\User;

				class AuthController extends Controller
				{

				    public $user;

				    public function __construct()
				    {
				        $this->middleware('auth:api', ['except' => ['login', 'register', 'redirectToProvider', 'handleProviderCallback']]);
				    }

				    public $successStatus = 200;

				    public function login()
				    {
				        $data = request()->validate([
				            'email' => 'required',
				            'password' => 'required',
				        ]);

				        if(Auth::attempt($data)) {
				            return $this->responseAfterLogin();
				        }

				        //Inner objects are created based on manual app->Exceptions->ValidationErrorException structure for best practice.
				        return response()->json(['errors' => ['meta' => ['unauthorised' => 'Incorrect Email or Password!']]], 401);
				    }

				    public function register(Request $request)
				    {
				        $data = request()->validate([
				            'name' => 'required',
				            'email' => 'required|email',
				            'city' => 'required',
				            'gender' => 'required',
				            'birthday' => 'required',
				            'interest' => 'required',
				            'about' => 'required',
				            'provider_id' => '',
				            'password' => 'required',
				            'confirm_password' => 'required|same:password',
				        ]);

				        $data['password'] = bcrypt($data['password']);

				        User::create($data);

				        return $this->login();
				    }

				    public function responseAfterLogin() {
				        $user = auth()->user();

				        $token =  $user->createToken('MyApp')->accessToken;

				        //Send Mail notification
				        $user->notify(new LoginNotification($user));

				        return response()->json([
				            'access_token' => $token,
				            'name' => auth()->user()->name
				        ]);
				    }

				    public function me()
				    {
				        $user = auth()->user();

				        return response()->json(new UserResource($user), $this->successStatus);
				    }

				    public function logout(Request $request)
				    {
				        $user = auth()->user()->token()->revoke();

				        return response()->json('Successfully logged out', $this->successStatus);
				    }

				    public function redirectToProvider($provider)
				    {
				        return Socialite::driver($provider)->stateless()->redirect(); //We have to use stateless() because we are not using Laravel's default auth system
				    }

				    public function handleProviderCallback($provider)
				    {
				        $user = Socialite::driver($provider)->stateless()->user();

				        if (User::where('email', $user->email)->first()) {
				            //If user already exists
				            return view('passSocialiteDetails', ['email' => $user->email]);
				        } else {
				            //Else register User
				            $user = User::create([
				                'name' => ($user->nickname ?? $user->name),
				                'email' => $user->email,
				                'birthday' => '1996/1/1',
				                'provider_id' => $user->id,
				                'provider_name' => $provider,
				                'password' => bcrypt('password')
				            ]);

				            return view('passSocialiteDetails', ['email' => $user->email]);
				        }
				    }
				}


	[10.3] Setup MailTrap Account and paste details in .env
		#.env
			APP_NAME=Laravel
			APP_ENV=local
			APP_KEY=base64:hQxt8iXWf/Uri6fVe9qp1q89TInEaueIuDEflulocfY=
			APP_DEBUG=true
			APP_URL=http://localhost

			LOG_CHANNEL=stack

			DB_CONNECTION=mysql
			DB_HOST=127.0.0.1
			DB_PORT=3306
			DB_DATABASE=facebookPlus
			DB_USERNAME=root
			DB_PASSWORD=

			BROADCAST_DRIVER=log
			CACHE_DRIVER=file
			QUEUE_CONNECTION=sync
			SESSION_DRIVER=file
			SESSION_LIFETIME=120

			REDIS_HOST=127.0.0.1
			REDIS_PASSWORD=null
			REDIS_PORT=6379

			//These details will be availabe from the Mailtrap->Integrations->Laravel
			MAIL_MAILER=smtp
			MAIL_HOST=smtp.mailtrap.io
			MAIL_PORT=2525
			MAIL_USERNAME=2bbf0db70c4a74
			MAIL_PASSWORD=b95a3b148275a5
			MAIL_ENCRYPTION=tls
			MAIL_FROM_ADDRESS=admin@facebook.com
			MAIL_FROM_NAME="${APP_NAME}"

			AWS_ACCESS_KEY_ID=
			AWS_SECRET_ACCESS_KEY=
			AWS_DEFAULT_REGION=us-east-1
			AWS_BUCKET=

			PUSHER_APP_ID=
			PUSHER_APP_KEY=
			PUSHER_APP_SECRET=
			PUSHER_APP_CLUSTER=mt1

			MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
			MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

			GITHUB_CLIENT_ID=5a36980379c86875334d
			GITHUB_CLIENT_SECRET=84c3108b93b404488b7dd39fe692b444c5de8b2a

			GOOGLE_CLIENT_ID=229400347394-r4u94vmuj22p4cla4s048ua79f6rs374.apps.googleusercontent.com
			GOOGLE_CLIENT_SECRET=w-h64fBJJqHtwvKEvNgyugSp

		#Run this commands just in case
			php artisan view:clear

			php artisan config:cache

			php artisan cache:clear

			php artisan route:cache



11) Search
	/*TNTSearch will scan the whole table which is why it will give us email as well along with username. 
	It should be done on tables like category so that we could directly use Category::search() in the model.*/
	[11.1] Installation & Setup
		//Instructions from the Laravel Docs
		composer require laravel/scout

		php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"

		//Install tntsearch package from https://github.com/teamtnt/laravel-scout-tntsearch-driver
		composer require teamtnt/laravel-scout-tntsearch-driver

		//Change the congif driver to tntsearch from algolia
		#config->scout.php
			<?php

			return [

			    'driver' => env('SCOUT_DRIVER', 'tntsearch'), //change from algoloa to tntsearch
			    ...
			    ...
			    'tntsearch' => [ //Create new tntsearch obj
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

		//Prevent search from being commited got git repo
		#.gitgnore
			'/storage/*.index' //(without'')

	[11.2] Backend operations
		[11.2.1] Add use Seachable in the respective Model that you want to perform search on
			//WARNING: Searchable in user may causes unexpected errors
			#app->User 
				<?php

				namespace App;

				use Illuminate\Contracts\Auth\MustVerifyEmail;
				use Illuminate\Foundation\Auth\User as Authenticatable;
				use Illuminate\Notifications\Notifiable;
				use Laravel\Passport\HasApiTokens;
				use Laravel\Scout\Searchable;

				use App\Post;
				use App\Comment;
				use App\Friend;
				use App\Avatar;
				use App\Item;
				use Carbon\Carbon;

				class User extends Authenticatable
				{
				    use Notifiable, HasApiTokens, Searchable;
				    
				    protected $fillable = [
				        'name', 'email', 'city', 'gender', 'birthday', 'interest', 'about', 'provider_id', 'provider_name', 'password',
				    ];

				    protected $dates = ['birthday'];

				    protected $hidden = [
				        'password', 'remember_token',
				    ];

				    protected $casts = [
				        'email_verified_at' => 'datetime',
				    ];

				    public function getPathAttribute()
				    {
				        return "/users/$this->id";
				    }

				    public function posts()
				    {
				        return $this->hasMany(Post::class);
				    }

				    public function comments()
				    {
				        return $this->hasMany(Comment::class);
				    }

				    public function friends()
				    {
				        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id');
				    }

				    public function likes()
				    {
				        return $this->belongsToMany(Post::class, 'likes', 'user_id', 'post_id');
				    }

				    public function images()
				    {
				        return $this->hasMany(Avatar::class);
				    }

				    public function items()
				    {
				        return $this->hasMany(Item::class);
				    }

				    public function bookmarks()
				    {
				        return $this->belongsToMany(Item::class, 'bookmarks', 'user_id', 'item_id');
				    }

				    public function coverImage()
				    {
				        return $this->hasOne(Avatar::class)
				            ->orderByDesc('id')
				            ->where('type', 'cover')
				            ->withDefault(function ($image) {
				                $image->path = 'uploadedAvatars/cover.jpg';
				                $image->width = 1500;
				                $image->height = 500;
				                $image->type = 'cover';
				            });
				    }

				    public function profileImage()
				    {
				        return $this->hasOne(Avatar::class)
				            ->orderByDesc('id')
				            ->where('type', 'profile')
				            ->withDefault(function ($image) {
				                $image->path = 'uploadedAvatars/profile.jpg';
				                $image->width = 750;
				                $image->height = 750;
				                $image->type = 'profile';
				            });
				    }

				    //While post or put request, the birthday would be a string of '27/05/2000'. It needs to be converted into Carbon date before saving into the database. That's why this inbuilt function is used.
				    public function setBirthdayAttribute($birthday)
				    {
				        $this->attributes['birthday'] = Carbon::parse($birthday);
				    }
				}


		[11.2.2] Import scout in the database and make Route and Controller 
			php artisan tntsearch:import \\App\\User

			php artisan make:controller SearchController

			#app->Http->Controllers->SearchController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;
				use App\User;

				class SearchController extends Controller
				{
				    public function getUsers(Request $request) //Nothing to do with tntseatch. Can be done normally as well.
				    {
				        $myString = $request->searchTerm;

				        $searchResult = User::where('name', 'like', "%$myString%")->get();

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

			#routes->api.php
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				//Every route in this file MUST have an api prefix.

				//AUTH
				Route::post('/login', 'AuthController@login');
				Route::post('/register', 'AuthController@register');
				Route::post('/me', 'AuthController@me');
				Route::post('/logout', 'AuthController@logout');
				//auth middleware in Constructor of AuthController is added. If not, I need to put me and logout routes inside the Route::middleware('auth:api') group

				//SOCIALITE
				Route::get('/login/{provider}', 'AuthController@redirectToProvider');
				Route::get('/login/{provider}/callback', 'AuthController@handleProviderCallback');

				Route::middleware('auth:api')->group(function () {
				    //CRUD
				    Route::apiResource('/posts', 'PostController');
				    Route::apiResource('/users', 'UserController');
				    Route::apiResource('/posts/{post}/comments', 'CommentController');
				    Route::apiResource('/items', 'ItemController');
				    Route::apiResource('/categories', 'CategoryController');

				    //FRIEND REQUEST
				    Route::post('/send-request', 'FriendController@sendRequest');
				    Route::post('/confirm-request', 'FriendController@confirmRequest');
				    Route::post('/delete-request', 'FriendController@deleteRequest');

				    //LIKE, FAVOURITE, BOOKMARK
				    Route::post('/posts/{post}/like-dislike', 'LikeController@likeDislike');
				    Route::post('/posts/{post}/comments/{comment}/favourite-unfavourite', 'FavouriteController@favouriteUnfavourite');
				    Route::post('/items/{item}/bookmark-unbookmark', 'BookmarkController@bookmarkUnbookmark');

				    //IMAGE
				    Route::post('/upload-avatars', 'AvatarController@uploadAvatar');
				    Route::post('/upload-pictures', 'PictureController@uploadPicture');
				    Route::post('/upload-images', 'ImageController@uploadImage');
				    Route::post('/upload-gif', 'GifController@uploadGif');

				    //SHARE
				    Route::post('/share-post', 'ShareController@sharePost');

				    //FEATURES
				    Route::post('/filter-birthdays', 'FeatureController@filterBirthdays');
				    Route::post('/wish-birthday', 'FeatureController@wishBirthday');
				    Route::post('/notify-tagged-user', 'FeatureController@notifyTaggedUser');
				    Route::post('/get-all-avatars', 'FeatureController@getAllAvatars');


				    //NOTIFICATIONS
				    Route::post('/notifications', 'NotificationController@index');
				    Route::post('/mark-as-read', 'NotificationController@markAsRead');
				    Route::post('/hide-friend-buttons', 'NotificationController@hideFriendButtons');

				    //SEARCH
				    Route::post('/search', 'SearchController@getUsers');
				});


	[11.3] Frontend operations
		#resources->js->components->Extra->SearchBlock.vue
			<template>
			    <div class="relative">
			        <div class="absolute mx-2 text-xl text-gray-600"><i class="fas fa-search"></i></div>

			        <input @input="dispatchSearchUsers" v-model="searchTerm" @focus="searchMode = true" type="text" class="w-56 h-8 pl-10 text-sm rounded-full bg-gray-200 focus:outline-none focus:outline-none" placeholder="Search...">

			        <div v-if="searchMode" @click="searchMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

			        <div v-if="searchMode" class="absolute bg-white w-56 mt-2 text-xs shadow-2xl z-20 border border-gray-300">
			            <div v-if="searchResult.length == 0" class="p-2">No Result found for '{{searchTerm}}'</div>

			            <div v-for="user in searchResult" :key='user.id' @click="searchMode = false, searchTerm = ''">
			                <router-link :to="'/users/' + user.id" class="flex items-center p-2 border-b border-gray-200 hover:bg-gray-100">
			                    <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + user.profile_image.path" alt="Profile Image">

			                    <p class="mx-2 text-blue-700 font-semibold">{{user.name}}</p>
			                </router-link>
			            </div>

			            <p class="bg-gray-100 p-1 text-center font-medium text-blue-700 border-t border-gray-300">See more users</p>
			        </div>
			    </div>
			</template/>

			<script>
			    import _ from 'lodash';
			    import {mapGetters} from "vuex";

			    export default {
			        name: "SearchBlock",

			        computed: {
			            ...mapGetters({
			                searchResult: 'searchResult',
			            })
			        },

			        data() {
			            return {
			                searchTerm: '',
			                searchMode: false
			            }
			        },

			        methods: {
			            dispatchSearchUsers: _.debounce(function (e) {
			                if(this.searchTerm.length < 2) {
			                    return
			                }

			                this.$store.dispatch('fetchSearchResult', this.searchTerm)
			            }, 500)
			        }
			    }
			</script>

			<style scoped>

			</style>

//Follow the Notification steps above to setup TagNotification, NotificationController and NotificationResource. 
//Just only related to tagging and notifying tagged user.
12) Tag User (Comments) 
	[12.1] Backend Operations
		[12.1.1] Check functions in Controllers
			//Fetch searched users
			#app->Http->Controllers->SearchController 
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;
				use App\User;

				class SearchController extends Controller
				{
				    public function getUsers(Request $request)
				    {
				        $myString = $request->searchTerm;

				        $searchResult = User::where('name', 'like', "%$myString%")->get();

				        return UserResource::collection($searchResult);

				        /* //If want to get search from the whole table which also includes email
				            $searchResult = User::search($request->searchTerm)->where('user_id', request()->user()->id)->get();

				            return UserResource::collection($searchResult);
				        */
				    }
				}

			//Notify TaggedUser. We can't do it in store() of CommentController because we are checking if there is a tag or not in the resource only.
			#app->Http->Controllers->FeatureController 
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Post as PostResource;
				use App\Notifications\BirthdayNotification;
				use App\Notifications\TagNotification;
				use App\Notifications\WishNotification;
				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;

				use Auth;
				use App\User;
				use App\Comment;
				use App\Avatar;


				class FeatureController extends Controller
				{
				    //Easy to filter birthdays of all users in front-end by passing user's birthday(d,m,y format) and current date(d,m,y format) through resource but I'm doing it here just practice queries
				    public function filterBirthdays()
				    {
				        //Today's Birthdays - Method 1
				        $today = User::where(User::raw("(DATE_FORMAT(birthday, '%d'))"), now()->format('d'))->get(); //Or use ->paginate(5);

				        //This week's Birthdays - Method 2 (Don't display today's birthdays)
				        $users =  User::all();
				        $week =[];

				        foreach ($users as $user) {
				            if($user->birthday->format('m') == now()->format('m') and in_array($user->birthday->format('d'), range(now()->format('d') + 1, now()->format('d') + 6))) {
				                array_push($week, $user);
				            }
				        }

				        //This month's Birthdays - Method 3 (Don't display today and this week's birthdays)
				        $month = User::whereRaw('birthday LIKE "%-'. now()->format('m') .'-%"' )->where(User::raw("(DATE_FORMAT(birthday, '%d'))"), ">",  now()->format('d') + 7)->get(); //Or use ->paginate(5);

				        //Won't implement because this function is called in the create() of vue which is why it will give a new notification everytime the page is refreshed. I will have to create a new function and notify the user there.
				        //Do it like notifyTaggedUser
				        /*
				            //Send notification
				            auth()->user()->notify(new BirthdayNotification($today));
				        */

				        return [
				            'today' => UserResource::collection($today),
				            'week' => UserResource::collection($week),
				            'month' => UserResource::collection($month)
				        ];
				    }

				    //Also considered as writing on other user's wall
				    public function wishBirthday(Request $request)
				    {
				        $post = Auth::user()->posts()->create([
				            'body' => $request->body,
				            'friend_id' => $request->friend_id,
				            'user_id' => Auth::user()->id
				        ]);

				        //Send notification
				        $friend = User::find($request->friend_id);
				        $friend->notify(new WishNotification($post));

				        return (new PostResource($post))->response()->setStatusCode(201);
				    }

				    //Send notification
				    public function notifyTaggedUser(Request $request) {
				        $tagged_user_id = $request->tagged_user_id;
				        $tagged_comment_id = $request->tagged_comment_id;

				        if($tagged_user_id != null && $tagged_user_id != Auth::user()->id) {
				            $tagged_user = User::find($tagged_user_id);
				            $tagged_comment = Comment::find($tagged_comment_id);
				            $tagged_user->notify(new TagNotification($tagged_comment));
				        }
				    }

				    public function getAllAvatars(Request $request)
				    {
				        $user_id = $request->user_id;

				        $avatars = Avatar::where('user_id', $user_id)->get();

				        return $avatars;
				    }
				}

		//Make sure there is a route for notifyTaggedUser()
		[12.1.2] Make sure routes are proper
			#routes->api.php
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				//Every route in this file MUST have an api prefix.

				//AUTH
				Route::post('/login', 'AuthController@login');
				Route::post('/register', 'AuthController@register');
				Route::post('/me', 'AuthController@me');
				Route::post('/logout', 'AuthController@logout');
				//auth middleware in Constructor of AuthController is added. If not, I need to put me and logout routes inside the Route::middleware('auth:api') group

				//SOCIALITE
				Route::get('/login/{provider}', 'AuthController@redirectToProvider');
				Route::get('/login/{provider}/callback', 'AuthController@handleProviderCallback');

				Route::middleware('auth:api')->group(function () {
				    //CRUD
				    Route::apiResource('/posts', 'PostController');
				    Route::apiResource('/users', 'UserController');
				    Route::apiResource('/posts/{post}/comments', 'CommentController');
				    Route::apiResource('/items', 'ItemController');
				    Route::apiResource('/categories', 'CategoryController');

				    //FRIEND REQUEST
				    Route::post('/send-request', 'FriendController@sendRequest');
				    Route::post('/confirm-request', 'FriendController@confirmRequest');
				    Route::post('/delete-request', 'FriendController@deleteRequest');

				    //LIKE, FAVOURITE, BOOKMARK
				    Route::post('/posts/{post}/like-dislike', 'LikeController@likeDislike');
				    Route::post('/posts/{post}/comments/{comment}/favourite-unfavourite', 'FavouriteController@favouriteUnfavourite');
				    Route::post('/items/{item}/bookmark-unbookmark', 'BookmarkController@bookmarkUnbookmark');

				    //IMAGE
				    Route::post('/upload-avatars', 'AvatarController@uploadAvatar');
				    Route::post('/upload-pictures', 'PictureController@uploadPicture');
				    Route::post('/upload-images', 'ImageController@uploadImage');
				    Route::post('/upload-gif', 'GifController@uploadGif');

				    //SHARE
				    Route::post('/share-post', 'ShareController@sharePost');

				    //FEATURES
				    Route::post('/filter-birthdays', 'FeatureController@filterBirthdays');
				    Route::post('/wish-birthday', 'FeatureController@wishBirthday');
				    Route::post('/notify-tagged-user', 'FeatureController@notifyTaggedUser');
				    Route::post('/get-all-avatars', 'FeatureController@getAllAvatars');


				    //NOTIFICATIONS
				    Route::post('/notifications', 'NotificationController@index');
				    Route::post('/mark-as-read', 'NotificationController@markAsRead');
				    Route::post('/hide-friend-buttons', 'NotificationController@hideFriendButtons');

				    //SEARCH
				    Route::post('/search', 'SearchController@getUsers');
				});


		[12.1.3] Add tag related fields in CommentResource
			#app->Http->Resources->Comment
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\User as UserResource;

				use App\User;


				class Comment extends JsonResource
				{
				    public function toArray($request)
				    {
				        //Operation For Tag
				        $users = User::all();

				        $newBody = null;
				        $taggedUserID = null;
				        $taggedUserName = null;

				        foreach ($users as $user) {
				            if (strpos($this->body, $user->name)) {
				                $replace = str_replace($user->name, '{ReplaceMe}', $this->body);
				                $newBody = explode("{ReplaceMe}", $replace);
				                $taggedUserID = $user->id;
				                $taggedUserName = $user->name;
				                break;
				            }
				        }

				        return [
				            'id' => $this->id,
				            'body' => $this->body,
				            'gif' => $this->gif,
				            'post_id' => $this->post_id,
				            'updated_at' => $this->updated_at->diffForHumans(),

				            'favourites' => new FavouriteCollection($this->favourites),
				            'user_favourited' => !! $this->favourites->where('user_id', auth()->id())->count(),
				            'favourited_type' => $this->favourites->where('user_id', auth()->id())->pluck('type'),

				            'tag' => [
				                'newBody' => $newBody,
				                'taggedUserID'=> $taggedUserID,
				                'taggedUserName'=> $taggedUserName,
				            ],

				            'commented_by' => new UserResource($this->user),

				            'path' => '/posts/' . $this->post_id . '/comments/' . $this->id,
				        ];
				    }
				}


	[12.3] Frontend Operations 
		//Again, follow Notification steps to setup notification model. Here I will only explain how to tag and notify tagged user.
		[12.3.1] Create/Modify js Module
			#resources->js->store->modules->search.js
				const state = {
				    searchResult: '',
				    searchErrors: null
				};

				const getters = {
				    searchResult: state => {
				        return state.searchResult;
				    },

				    searchErrors: state => {
				        return state.searchErrors;
				    }
				};

				const actions = {
				    fetchSearchResult({commit, state}, searchTerm) {
				        axios.post('/api/search', {searchTerm: searchTerm})
				            .then(res => commit('setSearchResult', res.data.data))
				            .catch(err => commit('setSearchErrors', err))
				    }
				};

				const mutations = {
				    setSearchResult(state, data) {
				        state.searchResult = data
				    },

				    setSearchErrors(state, err) {
				        state.searchErrors = err
				    },
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->comments.js
				import Posts from './posts'

				const state = {
				    //Unlike posts, we will pass the body from the vue file as a parameter (Just to do it differently)
				    commentErrors: null
				};

				const getters = {
				    commentErrors: state => {
				        return state.commentErrors;
				    }
				};

				const actions = {
				    createComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments', {body: data.body})
				            .then(res => {
				                commit('pushComments', {comments: res.data, post_index: data.post_index})
				                var latest_comment = res.data.data
				                axios.post('/api/notify-tagged-user', {tagged_user_id: latest_comment[0].tag.taggedUserID, tagged_comment_id: latest_comment[0].id})
				            })
				            .catch(err => commit('setCommentErrors', err))
				    },

				    updateComment({commit, state}, data) {
				        axios.put('/api/posts/' + data.post_id + '/comments/' + data.comment_id, {body: data.comment_body})
				            .then(res => {
				                commit('pushComments', {comments: res.data, post_index: data.post_index})
				                var latest_comment = res.data.data
				                axios.post('/api/notify-tagged-user', {tagged_user_id: latest_comment[0].tag.taggedUserID, tagged_comment_id: latest_comment[0].id})
				            })
				            .catch(err => commit('setPostErrors', err))
				    },

				    deleteComment({commit, state}, data) {
				        axios.delete('/api/posts/' + data.post_id + '/comments/' + data.comment_id)
				            .then(res => commit('spliceComment', data))
				            .catch(err => commit('setCommentErrors', err))
				    },

				    favouriteUnfavouriteComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments/' + data.comment_id + '/favourite-unfavourite', {type: data.type})
				            .then(res => commit('pushFavourites', {favourites: res.data, post_index: data.post_index, comment_index: data.comment_index}))
				            .catch(err => commit('setCommentErrors', err))
				    }
				};

				const mutations = {
				    setCommentErrors(state, err) {
				        state.commentErrors = err.response
				    },

				    pushComments(state, data) {
				        Posts.state.posts[data.post_index].comments = data.comments
				    },

				    // This is for the GifController. Just a different way. We are pushing the newly created gif comment.
				    pushComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.unshift(data.comment)
				    },

				    spliceComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.splice(data.comment_index, 1)
				    },

				    /*
				        Here we have to change user_favourited and favourited_type change manually as they are in CommentResource and not in the FavouriteCollection unlike Likes and Bookmarks.
				        If user_favourited was in FavouriteCollection, it would've been updated by default using ID as the id field would be user_id in FavouriteResource.
				        But it is only applicable in ManyToMany. As we are using HasMany, the $this->id in collection would refer to the id of favourite table's id which is useless.
				    */
				    pushFavourites(state, data) {
				        //We need to replace favourites Only for counts.
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].favourites = data.favourites
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].user_favourited = ! Posts.state.posts[data.post_index].comments.data[data.comment_index].user_favourited
				        Posts.state.posts[data.post_index].comments.data[data.comment_index].favourited_type = data.favourites.data[0].type
				    }
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->index.js
				import Vue from 'vue';
				import Vuex from 'vuex';
				import Auth from './modules/auth.js'
				import Title from './modules/title.js'
				import Request from './modules/request.js'
				import Posts from './modules/posts.js'
				import Comments from './modules/comments.js'
				import Items from './modules/items.js'
				import Categories from './modules/categories.js'
				import User from './modules/user.js'
				import Features from './modules/features.js'
				import Notifications from './modules/notifications.js'
				import Search from './modules/search.js'

				Vue.use(Vuex);

				export default new Vuex.Store({
				    modules: {
				        Auth,
				        Title,
				        Request,
				        Posts,
				        Comments,
				        Items,
				        Categories,
				        User,
				        Features,
				        Notifications,
				        Search
				    }
				});


		[12.3.2] Edit Components
			#resources->js->components->Comment->CreateComment.vue
				<template>
				    <div class="relative flex border-t border-gray-400 p-4 py-2">
				        <input v-model='body' @input="checkTags(body)" type="text" name="comment" placeholder="Add your comment..." class="w-full pl-4 h-8 bg-gray-200 rounded-lg focus:outline-none">

				        <div v-if="tagMode" @click="tagMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				        <div v-if="tagMode" class="absolute bg-white w-56 mt-8 top-0 text-xs shadow-2xl z-20 border border-gray-300">
				            <div v-for="user in searchResult" :key='user.id'>
				                <button @click="tagUser(user.name), tagMode = false" class="flex w-full items-center p-2 text-gray-800 font-semibold border-b border-gray-200 hover:bg-blue-700 hover:text-white">
				                    <img class="w-8 h-8 object-cover" :src="'/storage/' + user.profile_image.path" alt="Profile Image">

				                    <p class="mx-2">{{user.name}}</p>
				                </button>
				            </div>
				        </div>

				        <button v-if="body" @click="dispatchAddComment(body, post_id, post_index), body = ''"  class="bg-gray-200 ml-2 px-2 py-1 rounded-lg focus:outline-none">Post</button>

				        <button ref="commentGif" class="dz-clickable mx-2 w-8 h-8 rounded-full text-xl bg-gray-200 focus:outline-none">
				            <p class="dz-clickable"><i class="fas fa-camera"></i></p>
				        </button>
				    </div>
				</template>

				<script>
				    import Dropzone from 'dropzone';
				    import {mapGetters} from "vuex";

				    export default {
				        name: "CreateComment",

				        props: ['post_id', 'post_index'],

				        data() {
				            return {
				                body: '',
				                dropzone: null,
				                tagMode: false,
				                hasTag: false
				            }
				        },

				        mounted() {
				            this.dropzone = new Dropzone(this.$refs.commentGif, this.settings);
				        },

				        computed: {
				            ...mapGetters({
				                searchResult: 'searchResult',
				            }),

				            settings() {
				                return {
				                    paramName: 'gif', // field name is image
				                    url: '/api/upload-gif',
				                    acceptedFiles: 'image/*',
				                    clickable: '.dz-clickable', // <i> will not work as it is not a button. To make sure all the inner elements of button are clickable.
				                    autoProcessQueue: true, // True because we do not want to wait till post button. The comment should be added once the image is uploaded.
				                    maxFiles: 1,
				                    parallelUploads: 1,
				                    uploadMultiple: false,
				                    params: { //Cannot pass body here because settings() load when the component is mounted. Use sending.
				                        'width': 150,
				                        'height': 150,
				                    },
				                    headers: {
				                        //'X-CSRF-TOKEN': document.head.querySelector('meta[name=csrf-token]').content, (For api, when token is not needed)

				                        'Authorization': `Bearer ${localStorage.getItem('token')}`
				                    },
				                    sending: (file, xhr, postForm) => {
				                        postForm.append('body', this.body)
				                        postForm.append('post_id', this.post_id)
				                    },
				                    success: (e, res) => {
				                        this.dropzone.removeAllFiles()

				                        this.$store.commit('pushComment', {post_index: this.post_index, comment: res.data})

				                        this.body = ''
				                    },
				                    maxfilesexceeded: file => {
				                        this.dropzone.removeAllFiles()

				                        this.dropzone.addFile(file)
				                    }
				                }
				            }
				        },

				        methods: {
				            dispatchAddComment(body, post_id, post_index) {
				                this.$store.dispatch('createComment', {body, post_id, post_index})
				            },

				            checkTags(body) {
				                if(body.includes('@') && ! this.hasTag) { //Because we are allowing to use @ only once. Only dispatch result if @ doesn't exist at all.
				                    let index = body.indexOf('@')
				                    let searchTerm = body.substring(index + 1, index + 2)

				                    this.tagMode = true
				                    this.$store.dispatch('fetchSearchResult', searchTerm)
				                }
				            },

				            tagUser(name) { //I can pass body from the top as well but then I will have to creat 2 different buttons for editMode true and false which why this is another way to make <template> code look simple
				                if(this.editMode) {
				                    this.post.body = this.post.body.replace('@', `@${name} `)
				                } else {
				                    this.body = this.body.replace('@', `@${name} `)
				                }
				                this.tagMode = false
				                this.hasTag = true
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->CommentCard.vue
				<template>
				    <div class="flex justify-between">
				        <div :class="commentClass">
				            <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + comment.commented_by.profile_image.path" alt="Profile Image">

				            <div>
				                <div class="flex-auto ml-2 bg-gray-200 rounded-lg p-2 text-sm">
				                    <router-link :to="'/users/' + comment.commented_by.id" class="font-bold text-blue-700">
				                        {{comment.commented_by.name}}
				                    </router-link>

				                    <p v-if="! commentEditMode && ! comment.tag.taggedUserName" class="inline">{{comment.body}}</p>

				                    <p v-else-if="! commentEditMode && comment.tag.taggedUserName">{{comment.tag.newBody[0]}}<router-link :to="'/users/' + comment.tag.taggedUserID" class="text-blue-700 font-semibold">{{comment.tag.taggedUserName}}</router-link> {{comment.tag.newBody[1]}}</p>

				                    <div v-else class="relative inline ml-2">
				                        <input v-model="comment.body" @input="checkTags(comment.body)" class="outline-none px-2 border border-gray-400"></input>

				                        <div v-if="tagMode" @click="tagMode = false" class="fixed right-0 left-0 top-0 bottom-0"></div>

				                        <div v-if="tagMode" class="absolute bg-white w-56 mt-4 top-0 text-xs shadow-2xl z-20 border border-gray-300">
				                            <div v-for="user in searchResult" :key='user.id'>
				                                <button @click="tagUser(user), tagMode = false" class="flex w-full items-center p-2 text-gray-800 font-semibold border-b border-gray-200 hover:bg-blue-700 hover:text-white">
				                                    <img class="w-8 h-8 object-cover" :src="'/storage/' + user.profile_image.path" alt="Profile Image">

				                                    <p class="mx-2">{{user.name}}</p>
				                                </button>
				                            </div>
				                        </div>

				                        <button @click="dispatchEditComment(comment.id, comment_index, comment.body, comment.post_id, post_index), commentEditMode = false" class="ml-2 text-gray-700 focus:outline-none"><i class="fas fa-check-circle"></i></button>

				                        <button @click="cancelEditComment()" class="ml-2 text-gray-700 focus:outline-none"><i class="fas fa-ban"></i></button>
				                    </div>
				                </div>

				                <div v-if="comment.gif">
				                    <img :src="'/storage/' + comment.gif" class="ml-2 p-2">
				                </div>

				                <div class="relative flex justify-between text-xs">
				                    <div class="flex w-full">
				                        <div v-if="favouriteMode" class="absolute">
				                            <div class="flex justify-center items-center bg-white border shadow-2xl rounded-l-full rounded-r-full text-lg -mt-8">
				                                <button @click="dispatchFavouriteComment(comment.id, comment_index, comment.post_id, post_index, 1), favouriteMode = ! favouriteMode" class="mx-2">❤️</button>
				                                <button @click="dispatchFavouriteComment(comment.id, comment_index, comment.post_id, post_index, 2), favouriteMode = ! favouriteMode" class="mx-2">😝</button>
				                                <button @click="dispatchFavouriteComment(comment.id, comment_index, comment.post_id, post_index, 3), favouriteMode = ! favouriteMode" class="mx-2">😢</button>
				                            </div>
				                        </div>

				                        <button v-if="! comment.user_favourited" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Like</button>
				                        <button v-if="comment.user_favourited && comment.favourited_type == 1" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">❤</button>
				                        <button v-if="comment.user_favourited && comment.favourited_type == 2" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">😝</button>
				                        <button v-if="comment.user_favourited && comment.favourited_type == 3" @click="favouriteMode = ! favouriteMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">😢</button>

				                        <button @click="changeEditMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Edit</button>

				                        <button @click="dispatchDeleteComment(comment.id, comment_index, comment.post_id, post_index)" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Delete</button>

				                        <p class="ml-4 text-xs">{{comment.updated_at}}</p>
				                    </div>

				                    <div>
				                        <div class="flex justify-center items-center bg-white border shadow-2xl rounded-l-full rounded-r-full text-sm -mt-2 px-1">
				                            <p>❤️</p>
				                            <p>😝</p>
				                            <p>😢</p>
				                            <p class="ml-2 font-medium text-gray-600">{{comment.favourites.favourite_count}}</p>
				                        </div>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>
				</template/>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "CommentCard",

				        props: ['comment', 'comment_index', 'post', 'post_index'],

				        computed: {
				            ...mapGetters({
				                searchResult: 'searchResult',
				            }),

				            commentClass() {
				                if (this.comment.gif) {
				                    return 'flex px-4 py-2'
				                }

				                return 'flex px-4 py-2 items-center'
				            }
				        },

				        data() {
				            return {
				                orginalCommentBody: null,
				                originalTaggedUserName: null,
				                originalTaggedUserID: null,
				                originalNewBody: null,

				                commentEditMode: false,
				                gifMode: false,
				                favouriteMode: false,
				                tagMode: false,
				                hasTag: false,
				            }
				        },

				        created() {
				            this.orginalCommentBody = this.post.comments.data[0].body
				            this.originalTaggedUserName = this.post.comments.data[0].taggedUserName
				            this.originalTaggedUserID = this.post.comments.data[0].taggedUserID
				            this.originalNewBody = this.post.comments.data[0].newBody
				        },

				        methods: {
				            dispatchEditComment(comment_id, comment_index, comment_body, post_id, post_index) {
				                this.$store.dispatch('updateComment', {comment_id, comment_index, comment_body, post_id, post_index})

				                if(! this.comment.body.includes('@')) {
				                    this.comment.tag.taggedUserName = null
				                    this.comment.tag.taggedUserID = null
				                    this.comment.tag.newBody = null
				                }
				                this.orginalCommentBody = this.comment.body
				            },

				            dispatchDeleteComment(comment_id, comment_index, post_id, post_index) {
				                this.$store.dispatch('deleteComment', {comment_id, comment_index, post_id, post_index})
				                this.orginalCommentBody = this.post.comments.data[0].body
				            },

				            dispatchFavouriteComment(comment_id, comment_index, post_id, post_index, type) {
				                this.$store.dispatch('favouriteUnfavouriteComment', {comment_id, comment_index, post_id, post_index, type})
				            },

				            checkTags(body) {
				                if(body.includes('@') && ! this.hasTag) { //Because we are allowing to use @ only once. Only dispatch result if @ doesn't exist at all.
				                    let index = body.indexOf('@')
				                    let searchTerm = body.substring(index + 1, index + 2)

				                    this.tagMode = true
				                    this.$store.dispatch('fetchSearchResult', searchTerm)
				                }
				            },

				            tagUser(user) { //I can pass body from the top as well but then I will have to creat 2 different buttons for editMode true and false which why this is another way to make <template> code look simple
				                this.comment.body = this.comment.body.replace('@', `@${user.name} `)
				                this.comment.tag.taggedUserName = user.name
				                this.comment.tag.taggedUserID = user.id
				                this.comment.tag.newBody = this.comment.body.split(user.name)
				                this.tagMode = false
				                this.hasTag = true
				            },

				            cancelEditComment() {
				                this.commentEditMode = false
				                this.comment.body = this.orginalCommentBody
				                if(this.comment.tag.taggedUserName != null) {
				                    this.comment.tag.taggedUserName = this.originalTaggedUserName
				                    this.comment.tag.taggedUserID = this.originalTaggedUserID
				                    this.comment.tag.newBody = this.originalNewBody
				                } else {
				                    this.comment.tag.taggedUserName = null
				                    this.comment.tag.taggedUserID = null
				                    this.comment.tag.newBody = null
				                }
				                this.hasTag = false
				            },

				            changeEditMode() {
				                this.commentEditMode = ! this.commentEditMode
				                this.orginalCommentBody = this.comment.body
				                this.originalTaggedUserName = this.comment.tag.taggedUserName
				                this.originalTaggedUserID = this.comment.tag.taggedUserID
				                this.originalNewBody = this.comment.tag.newBody
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			//Make sure profile component redirects authUser to tagged user's profile
			#resources->js->components->User->ShowUser.vue 
				<template>
				    <div v-if="user">
				        <div class="bg-white">
				            <div class="relative flex justify-center mx-32">
				                <div class="w-100 h-64 overflow-hidden z-10 rounded-lg">
				                    <UploadAvatar :newAvatar="user.cover_image" avatarClass="object-cover w-full" avatarAlt="Cover Image" avatarWidth="1500" avatarHeight="500" avatarType="cover"/>
				                </div>

				                <div class="absolute bottom-0 -mb-3 z-20">
				                    <UploadAvatar :newAvatar="user.profile_image" avatarClass="w-32 h-32 object-cover rounded-full shadow-lg border-2 border-gray-200" avatarAlt="Profile Image" avatarWidth="750" avatarHeight="750" avatarType="profile" />
				                </div>

				                <div class="absolute flex items-center bottom-0 right-0 mb-4 z-20 mx-4">
				                    <button v-if="friendButton && friendButton !== 'Accept'" @click="sendFriendRequest" class="py-1 px-3 bg-gray-400 text-sm text-gray-900 font-semibold rounded">
				                        <i class="fas fa-user-plus"></i> {{friendButton}}
				                    </button>

				                    <button v-if="friendButton && friendButton === 'Accept'" @click="acceptFriendRequest" class="py-1 px-3 bg-blue-500 text-sm text-gray-900 font-semibold mr-2 rounded">
				                        <i class="fas fa-user-check"></i> Accept
				                    </button>

				                    <button v-if="friendButton && friendButton === 'Accept'" @click="deleteFriendRequest" class="py-1 px-3 bg-gray-400 text-sm text-gray-900 font-semibold mr-2 rounded">
				                        <i class="fas fa-user-times"></i> Delete
				                    </button>
				                </div>
				            </div>

				            <div class="mx-36 py-4 border-b-2 border-gray-400">
				                <p class="mb-4 text-2xl text-gray-800 font-bold text-center">{{user.name}}</p>

				                <p class="text-sm text-gray-600 font-semibold text-center">{{user.about}}</p>
				            </div>

				            <div class="mx-36 flex justify-between items-center">
				                <div class="flex items-center h-full">
				                    <button class="text-sm text-blue-600 font-bold px-2 py-3 border-b-2 border-blue-600">Timeline</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">About</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">Albums</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">Friends</button>
				                    <button class="text-sm text-gray-700 font-bold px-2 py-3 border-b-2 border-white hover:border-blue-600">More <i class="fas fa-caret-down"></i></button>
				                </div>

				                <div class="flex">
				                    <button v-if="user.id == authUser.id" class="text-sm text-gray-700 font-bold my-2 mx-1 py-1 px-4 bg-gray-200 rounded-lg"><i class="fas fa-edit mr-2"></i>Edit Profile</button>
				                    <button v-else class="text-sm text-gray-800 font-bold my-2 mx-1 py-1 px-4 bg-gray-200 rounded-lg shadow"><i class="fas fa-user-friends mr-2"></i>Friends <i class="fas fa-caret-down"></i></button>
				                    <button class="text-sm text-gray-800 font-bold my-2 mx-1 py-1 px-4 bg-gray-200 rounded-lg shadow"><i class="fab fa-facebook-messenger"></i></button>
				                    <button class="text-sm text-gray-800 font-bold my-2 ml-1 py-1 px-4 bg-gray-200 rounded-lg shadow"><i class="fas fa-ellipsis-h"></i></button>
				                </div>
				            </div>
				        </div>

				        <div class="flex mx-36">
				            <div class="w-5/12 flex flex-col items-center my-4 mr-2">
				                <div class="w-full rounded bg-white p-4 my-4 shadow">
				                    <p class="text-md font-bold text-gray-900">About</p>

				                    <p class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-map-marker-alt mr-2"></i>Lives in <span class="text-gray-800 font-bold">{{user.city}}</span></p>
				                    <p class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-birthday-cake mr-2"></i>Birthday on <span class="text-gray-800 font-bold">{{user.birthday.day}}/{{user.birthday.month}}/{{user.birthday.year}}</span></p>
				                    <p class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-heart mr-2"></i>Interested in <span class="text-gray-800 font-bold">{{user.interest}}</span></p>
				                    <p v-if="user.gender == 'male'" class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-mars mr-2"></i>Male</p>
				                    <p v-else class="my-2 text-sm font-semibold text-gray-600"><i class="fas fa-venus mr-2"></i>Female</p>

				                    <div class="flex justify-center my-2">
				                        <button class="w-full p-1 text-sm font-bold text-gray-800 bg-gray-200 text-center shadow">See More About {{user.name}}</button>
				                    </div>
				                </div>

				                <div class="w-full rounded bg-white p-4 shadow">
				                    <div class="flex justify-between">
				                        <p class="text-md font-bold text-gray-900">Photos</p>
				                        <button @click="seeAllMode = ! seeAllMode" class="text-md font-medium text-blue-600">See All</button>
				                    </div>

				                    <div class="flex flex-wrap justify-between">
				                        <img v-if="! seeAllMode" v-for="avatar in avatars.slice(0, 4)" :key="avatar.id" class="w-35 h-35 my-1 object-cover" :src="'/storage/' + avatar.path" alt="Profile Image">
				                        <img v-if="seeAllMode" v-for="avatar in avatars" :key="avatar.id" class="w-35 h-35 my-1 object-cover" :src="'/storage/' + avatar.path" alt="Profile Image">
				                    </div>

				                    <div class="flex justify-center my-2">
				                        <button class="w-full p-1 text-sm font-bold text-gray-800 bg-gray-200 text-center shadow">See More About {{user.name}}</button>
				                    </div>
				                </div>
				            </div>

				            <div class="w-7/12 flex flex-col items-center py-4 ml-2">
				                <CreatePost :type="'profile'" :friend_id="user.id" class="w-full mt-4" />

				                <p v-if="status.posts == 'loading' && posts.length < 1">Loading Posts...</p>

				                <PostCard class="w-full" v-else v-for="(post, index) in posts" :key="index" :post="post"/>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import PostCard from "../Extra/PostCard";
				    import UploadAvatar from "../Extra/UploadAvatar";
				    import { mapGetters } from 'vuex'
				    import CreatePost from "../Post/CreatePost";

				    export default {
				        name: "ShowUser",

				        components: {CreatePost, PostCard, UploadAvatar},

				        computed: {
				            ...mapGetters({
				                user: 'user',
				                authUser: 'authUser',
				                avatars: 'avatars',
				                posts: 'posts',
				                friendButton: 'friendButton',
				                userErrors: 'userErrors',
				                status: 'status',
				            })
				        },

				        data() {
				            return {
				                seeAllMode: false
				            }
				        },

				        created() {
				            this.$store.dispatch('fetchUser', this.$route.params.userId)
				            this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
				            this.$store.dispatch('fetchAllAvatars', this.$route.params.userId)
				        },

				        methods: {
				            sendFriendRequest() {
				                this.$store.dispatch('sendRequest', this.$route.params.userId)
				            },

				            acceptFriendRequest() {
				                this.$store.dispatch('acceptRequest', this.$route.params.userId)
				            },

				            deleteFriendRequest() {
				                this.$store.dispatch('deleteRequest', this.$route.params.userId)
				            }
				        },

				        watch:{
				            $route (to, from){
				                this.$store.dispatch('fetchUser', this.$route.params.userId)
				                this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>




















/*
	0. NotificationBlock design fix
	1. Logged in user's birthday (Thursday)
	2. Spatie Tutorial
*/


//FRIDAY















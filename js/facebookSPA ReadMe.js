1) Create a project
	laravel new facebookSPA



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
			use Lcobucci\JWT\Parser;

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
		php artisan make:model Like -mf
		php artisan make:model Image -mfr
		php artisan make:model Picture -mfr

	[3.2] Add values in Migration
		#user
			Schema::create('users', function (Blueprint $table) {
	            $table->id();
	            $table->string('name');
	            $table->string('email')->unique();
	            $table->timestamp('email_verified_at')->nullable();
	            $table->string('password');
	            $table->rememberToken();
	            $table->timestamps();
	        });

		#posts
			Schema::create('posts', function (Blueprint $table) {
	            $table->id();
	            $table->string('body');
	            $table->unsignedBigInteger('user_id');
	            $table->timestamps();

	            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
	        });

	    #comments
	    	Schema::create('comments', function (Blueprint $table) {
	            $table->id();
	            $table->text('body');
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

	    #images
	    	Schema::create('images', function (Blueprint $table) {
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
	            $table->string('type');
	            $table->unsignedBigInteger('post_id');
	            $table->timestamps();

	            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
	        });

	[3.3] Add relationship in Models
		#User
			<?php

			namespace App;

			use Illuminate\Contracts\Auth\MustVerifyEmail;
			use Illuminate\Foundation\Auth\User as Authenticatable;
			use Illuminate\Notifications\Notifiable;
			use Laravel\Passport\HasApiTokens;

			use App\Post;
			use App\Comment;
			use App\Friend;
			use App\Image;


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
			        return $this->hasMany(Image::class);
			    }

			    public function coverImage()
			    {
			        return $this->hasOne(Image::class)
			            ->orderByDesc('id')
			            ->where('type', 'cover')
			            ->withDefault(function ($image) {
			                $image->path = 'uploadedImages/cover.jpg';
			                $image->width = 1500;
			                $image->height = 500;
			                $image->type = 'cover';
			            });
			    }

			    public function profileImage()
			    {
			        return $this->hasOne(Image::class)
			            ->orderByDesc('id')
			            ->where('type', 'profile')
			            ->withDefault(function ($image) {
			                $image->path = 'uploadedImages/profile.png';
			                $image->width = 750;
			                $image->height = 750;
			                $image->type = 'profile';
			            });
			    }

			    /*public function friends()
			    {
			        return $this->hasMany(Friend::class);
			    }*/
			}

		#Post
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;
			use App\Scopes\ReverseScope;

			use App\User;
			use App\Comment;


			class Post extends Model
			{
			    protected $fillable = ['body', 'user_id'];

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

			    public function singlePicture()
			    {
			        return $this->hasOne(Picture::class)
			            ->orderByDesc('id')
			            ->where('type', 'single');
			    }

			    public function multiplePictures()
			    {
			        return $this->hasMany(Picture::class)
			            ->where('type', 'album');
			    }
			}

		#Comment
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			use App\Post;
			use App\User;


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
			    //
			}

		#Image
			<?php

			namespace App;

			use Illuminate\Database\Eloquent\Model;

			class Image extends Model
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

	[3.4] Edit Factories
		#UserFactory
			<?php

			/** @var \Illuminate\Database\Eloquent\Factory $factory */

			use App\User;
			use Faker\Generator as Faker;
			use Illuminate\Support\Str;

			$factory->define(User::class, function (Faker $faker) {
			    return [
			        'name' => $faker->name,
			        'email' => $faker->unique()->safeEmail,
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

			use App\User;
			use App\Post;
			use App\Comment;


			$factory->define(Comment::class, function (Faker $faker) {
			    return [
			        'body' => $faker->text,
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

			/*
				In blogSPA we didn't add post_id and used $post as RMB because we used hasMany relationship.
				It won't work here because we are using mant2many relationship in this project.
			*/
			$factory->define(Like::class, function (Faker $faker) {
			    return [
			        'post_id' => function() {
			            return User::all()->random();
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
		use App\Like;


		class DatabaseSeeder extends Seeder
		{
		    public function run()
		    {
		        factory(User::class, 5)->create();
		        factory(Post::class, 10)->create();
		        factory(Like::class, 5)->create();
		        factory(Comment::class, 10)->create();
		    }
		}

	[3.6] Make api routes
		<?php

		use Illuminate\Http\Request;
		use Illuminate\Support\Facades\Route;


		//AUTH
		Route::post('/login', 'AuthController@login');
		Route::post('/register', 'AuthController@register');
		Route::post('/me', 'AuthController@me');
		Route::post('/logout', 'AuthController@logout');
		//auth middleware in Constructor of AuthController is added. If not, I need to put me and logout routes inside the Route::middleware('auth:api') group

		Route::middleware('auth:api')->group(function () {
		    Route::get('/user', function (Request $request) {
		        return $request->user();
		    });

		    //CRUD
		    Route::apiResource('/posts', 'PostController');
		    Route::apiResource('/users', 'UserController');
		    Route::apiResource('/posts/{post}/comments', 'CommentController');

		    //FRIEND REQUEST
		    Route::post('/send-request', 'FriendController@sendRequest');
		    Route::post('/confirm-request', 'FriendController@confirmRequest');
		    Route::post('/delete-request', 'FriendController@deleteRequest');

		    //LIKE
		    Route::post('/posts/{post}/like-dislike', 'LikeController@likeDislike');

		    //IMAGE
		    Route::post('/upload-images', 'ImageController@uploadImage');
		    Route::post('/upload-pictures', 'PictureController@uploadPicture');
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

	[3.8] Make Resources and Collections
		#User
			php artisan make:resource User

			#app->http->resources->User.php
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use App\Http\Resources\Friend as FriendResource;
				use App\Http\Resources\Image as ImageResource;

				use App\Friend;

				class User extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'name' => $this->name,
				            'email' => $this->email,
				            'friendship' => new FriendResource(Friend::friendship($this->id)),

				            'cover_image' => new ImageResource($this->coverImage),

				            'profile_image' => new ImageResource($this->profileImage),

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


				class Post extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'body' => $this->body,
				            'user_id' => $this->user_id,
				            'created_at' => $this->created_at->diffForHumans(),

				            'single_picture' => new PictureResource($this->singlePicture),

				            'multiple_pictures' => new PictureCollection($this->multiplePictures),

				            'likes' => new LikeCollection($this->likes),

				            'comments' => new CommentCollection($this->comments),

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

				class PostCollection extends ResourceCollection
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => $this->collection,
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

				use App\Http\Resources\User as UserResource;
				use Illuminate\Http\Resources\Json\JsonResource;

				class Comment extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'id' => $this->id,
				            'body' => $this->body,
				            'post_id' => $this->post_id,
				            'updated_at' => $this->updated_at->diffForHumans(),

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

				use App\Http\Resources\User as UserResource;
				use Illuminate\Http\Resources\Json\JsonResource;

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
				            'path' => url('/users/'.$this->friend_id)
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
				            'created_at' => $this->created_at->now()->diffForHumans(),
				            'post_id' => $this->pivot->post_id,
				            'path' => url('/posts/' . $this->pivot->post_id),
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
				            'type' => $this->type,
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

	[3.9] Modify Controllers
		#UserController
			php artisan make:controller UserController -r

			#app->Http->Controllers->UserController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\PostCollection;
				use Illuminate\Http\Request;
				use App\Http\Resources\User as UserResource;

				use App\User;


				class UserController extends Controller
				{
				    public function index(User $user)
				    {

				    }

				    public function store(Request $request)
				    {
				        //
				    }

				    public function show(User $user)
				    {
				        return [new UserResource($user), new PostCollection($user->posts()->latest()->get())];
				    }

				    public function update(Request $request, $id)
				    {
				        //
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
				use Intervention\Image\Facades\Image;


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

				    public function store()
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
				        
				        $data = request()->validate([
				            'body' => '',
				        ]);

				        $post = request()->user()->posts()->create($data);

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
				use App\Http\Resources\Comment as CommentResource;
				use App\Http\Resources\CommentCollection;
				use App\Http\Resources\Post as PostResource;

				use App\Comment;
				use App\Post;


				class CommentController extends Controller
				{
				    public function index(Post $post)
				    {
				        return new PostResource($post);
				    }

				    public function store(Post $post)
				    {
				        /*
				            public function store(Post $post, CommentRequest $request)
				            {
				                $request['user_id'] = auth()->user()->id;

						        $comment = $post->comments()->create($request->all());
				            }
				        */
				        $data = request()->validate([
				            'body' => 'required',
				        ]);

				        /*
				            $comment = $post->comments()->create(array_merge($data, ['user_id' => auth()->user()->id]));

				            return new CommentResource($comment);
				        */
				        $post->comments()->create(array_merge($data, ['user_id' => auth()->user()->id]));

				        return new CommentCollection($post->comments);
				    }

				    public function show(Comment $comment)
				    {
				        //
				    }

				    public function update(Request $request, Post $post, Comment $comment)
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

				use Illuminate\Http\Request;
				use \App\Http\Resources\Friend as FriendResource;

				use Illuminate\Database\Eloquent\ModelNotFoundException;
				use App\Exceptions\UserNotFoundException;
				use App\Exceptions\RequestNotFoundException;
				use App\Exceptions\ValidationErrorException;
				use Illuminate\Validation\ValidationException;

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

				        /*We have to find user because here we are not using Route Model Binding.
				        For RMB, the route would be like:
						    Route::post('/replies/{reply}/like', 'LikeController@likeIt');
				        And the function would be like:
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

				        /*Attach is used for many to many (belongsToMany) relationship.
				        Attach will cause repeat the same values in database.
				        In the migration unique has been added which is why attach will try to add the same user_id and friend_id and it will give integrity constrain error.
				        Here, $user has the friend_if which will automatically be filled in the friends table*/
				        $user->friends()->syncWithoutDetaching(Auth::user());

				        /*If you want to use hasMany instead of belongsToMany you have to use create
				            $user->friends()->create([
				                'friend_id' => $data['friend_id'], 'user_id' => auth()-> id()
				            ]);
				        */

				        $friendRequest = Friend::where('user_id', auth()->user()->id)
				            ->where('friend_id', $data['friend_id'])
				            ->first();

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

			php artisan storage:link

			composer require intervention/image

			#app->Http->Controllers->LikeController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\LikeCollection;
				use Illuminate\Http\Request;

				use App\Post;


				class LikeController extends Controller
				{
				    public function likeDislike(Post $post)
				    {
				        $post->likes()->toggle(auth()->user());

				        return new LikeCollection($post->likes);
				    }
				}

		#ImageController
			php artisan make:controller ImageController

			#app->Http->Controllers->ImageController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Image as ImageResource;
				use Illuminate\Http\Request;
				use Intervention\Image\Facades\Image;

				class ImageController extends Controller
				{
				    public function uploadImage()
				    {
				        $data = request()->validate([
				            'image' => '',
				            'width' => '',
				            'height' => '',
				            'type' => '',
				        ]);

				        //Create link to the storage and save the image there.
				        $image = $data['image']->store('uploadedImages', 'public');

				        //Crop image ni respect of requested height and width in case the size of image is bigger than requested width and height.
				        Image::make($data['image'])
				            ->fit($data['width'], $data['height'])
				            ->save(storage_path('app/public/uploadedImages/' . $data['image']->hashName()));

				        //Save the image in the database.
				        $userImage = auth()->user()->images()->create([
				            'path' => $image,
				            'width' => $data['width'],
				            'height' => $data['height'],
				            'type' => $data['type']
				        ]);

				        return new ImageResource($userImage);
				    }
				}

		#PictureController
			php artisan make:controller PictureController

			#app->Http->Controllers->PictureController.php
				<?php

				namespace App\Http\Controllers;

				use App\Http\Resources\Picture as PictureResource;
				use App\Http\Resources\Post as PostResource;
				use App\Picture;
				use App\Post;
				use Illuminate\Http\Request;
				use Intervention\Image\Facades\Image;

				class PictureController extends Controller
				{
				    public function uploadPicture()
				    {
				        $imageData = request()->validate([
				            'image' => '',
				        ]);

				        $postData = request()->validate([
				            'body' => '',
				            'post_id' => ''
				        ]);

				        $post = null;
				        $post = Post::find($postData['post_id']);

				        //Store or Update the post body in the posts table of database.
				        if($post != null) {
				            $post->update(['body'=> $postData['body']]);
				        } else {
				            $post = request()->user()->posts()->create($postData);
				        }

				        //Store picture as single or multiple picture in the pictures table of the database.
				        if(count($imageData['image']) == 1) {
				            $image = $imageData['image'][0];

				            //Create link to the storage and save the image there.
				            $storedImage = $image->store('uploadedPostImages', 'public');

				            //Crop image in respect of requested height and width in case the size of image is bigger than requested width and height.
				            Image::make($image)
				                ->save(storage_path('app/public/uploadedPostImages/' . $image->hashName()));

				            //Save the picture in the pictures table of database.
				            Picture::create([
				                'path' => $storedImage,
				                'type' => 'single',
				                'post_id' => $post->id
				            ]);
				        } else {
				            $images = $imageData['image'];

				            foreach ($images as $image) {
				                //Create link to the storage and save the image there.
				                $storedImage = $image->store('uploadedPostImages', 'public');

				                //Crop image in respect of requested height and width in case the size of image is bigger than requested width and height.
				                Image::make($image)
				                    ->fit(750, 750)
				                    ->save(storage_path('app/public/uploadedPostImages/' . $image->hashName()));

				                //Save the picture in the pictures table of database.
				                Picture::create([
				                    'path' => $storedImage,
				                    'type' => 'album',
				                    'post_id' => $post->id
				                ]);
				            }
				        }

				        return (new PostResource($post))->response()->setStatusCode(201);
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
			use Illuminate\Foundation\Testing\WithFaker;
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

    [5.3] Testing for posts
    	php artisan make:test PostTest 

    	#tests->Feature->PostTest.php
			<?php

			namespace Tests\Feature;

			use App\Friend;
			use App\Image;
			use App\Picture;
			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use App\Http\Resources\UserResource;
			use Illuminate\Http\UploadedFile;
			use Illuminate\Support\Facades\Storage;
			use Tests\TestCase;
			use Illuminate\Support\Facades\Artisan;

			use App\User;
			use App\Post;
			use Carbon\Carbon;


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

			    private function data()
			    {
			        return [
			            'body' => 'This is a new post.',
			        ];
			    }

			    /** @test */
			    //actingAs is another way to login if you don't want pass the token
			    public function auth_user_can_fetch_all_posts_of_his_friends()
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
			        $response = $this->post('/api/posts', $this->data(), $this->server);

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
			            'image' => [$file],
			            'post_id' => '',
			            'user_id' => $user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedPostImages/' . $file->hashName());

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

			                'comments' => [

			                ],

			                'likes' => [

			                ],

			                'single_picture' => [
			                    'id' => $picture->id,
			                    'path' => $picture->path,
			                    'type' => $picture->type,
			                ],

			                'multiple_pictures' => [

			                ],

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
			        $this->withoutExceptionHandling();

			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file1 = UploadedFile::fake()->image('postImage1.jpg');
			        $file2 = UploadedFile::fake()->image('postImage2.jpg');
			        $file3 = UploadedFile::fake()->image('postImage3.jpg');

			        $response = $this->post('/api/upload-pictures', [
			            'body' => 'test Body',
			            'image' => [$file1, $file2, $file3],
			            'post_id' => '',
			            'user_id' => $user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedPostImages/' . $file1->hashName());
			        Storage::disk('public')->assertExists('uploadedPostImages/' . $file2->hashName());
			        Storage::disk('public')->assertExists('uploadedPostImages/' . $file3->hashName());

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

			                'comments' => [

			                ],

			                'likes' => [

			                ],

			                'single_picture' => [

			                ],

			                'multiple_pictures' => [
			                    'data' => [
			                        [
			                            'id' => $picture1->id,
			                            'path' => $picture1->path,
			                            'type' => $picture1->type,
			                        ],
			                        [
			                            'id' => $picture2->id,
			                            'path' => $picture2->path,
			                            'type' => $picture2->type,
			                        ],
			                        [
			                            'id' => $picture3->id,
			                            'path' => $picture3->path,
			                            'type' => $picture3->type,
			                        ],
			                    ],
			                    'links' => [
			                        'self' => '/posts'
			                    ],
			                    'picture_count' => 3
			                ],

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
			    public function auth_user_can_update_picture_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('postImage.jpg');

			        $post = factory(Post::class)->create(['user_id' => $user->id]);

			        $response = $this->post('/api/upload-pictures', [
			            'body' => 'test Body',
			            'image' => [$file],
			            'post_id' => $post->id,
			            'user_id' => $user->id
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedPostImages/' . $file->hashName());

			        $this->assertCount(1, Post::all());
			        $this->assertCount(1, Picture::all());

			        $post = Post::first();
			        $picture = Picture::first();

			        $response->assertJson([
			            'data' => [
			                'id' => $post->id,
			                'body' => 'test Body',
			                'user_id' => $post->user_id,
			                'created_at' => $post->created_at->diffForHumans(),

			                'comments' => [

			                ],

			                'likes' => [

			                ],

			                'single_picture' => [
			                    'id' => $picture->id,
			                    'path' => $picture->path,
			                    'type' => $picture->type,
			                ],

			                'multiple_pictures' => [

			                ],

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
			    public function auth_user_can_delete_posts()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['user_id' => $user->id]);

			        $response = $this->delete('/api/posts/' . $post->id);

			        $response->assertStatus(204);

			        $posts = Post::all();

			        $this->assertCount(0, $posts);
			    }
			}

	[5.4] Testing for comments
    	php artisan make:test CommentTest 

    	#tests->Feature->CommentTest.php
    		<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;

			use App\Post;
			use App\User;
			use App\Comment;


			class CommentTest extends TestCase
			{
			    use RefreshDatabase;

			    /** @test */
			    public function posts_are_returned_with_comments()
			    {
			        $this->withoutExceptionHandling();

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

			                    'likes' => [
			                        'data' => [

			                        ],
			                        'like_count' => 0,
			                        'user_liked' => false,
			                        'links' => [
			                            'self' => '/posts',
			                        ]
			                    ],

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
			    public function auth_user_can_create_a_comment()
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
			    public function auth_user_can_edit_a_comment()
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
			    public function body_is_required_to_comment_on_a_post()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $post = factory(Post::class)->create(['id' => 123]);

			        $response = $this->post('/api/posts/' . $post->id . '/comments');

			        $response->assertStatus(422);

			        $responseString = json_decode($response->getContent(), true); //true will convert the object into array

			        $this->assertArrayHasKey('body', $responseString['errors']['meta']);
			    }
			}

	[5.5] Testing for user
		php artisan make:test UserTest

		#tests->Feature->UserTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use App\Http\Resources\UserResource;
			use Tests\TestCase;

			use App\Post;
			use App\User;


			class UserTest extends TestCase
			{
			    use RefreshDatabase;

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
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_check_user_profiles_and_posts()
			    {
			        $this->withoutExceptionHandling();

			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $posts = factory(Post::class, 2)->create(['user_id' => $user->id]);

			        $response = $this->get('/api/users/' . $user->id);

			        $response->assertStatus(200);

			        $response->assertJson([
			            [
			                'name' => $user->name,
			                'email' => $user->email,
			            ],
			            [
			                'data' => [
			                    [
			                        'id' => $posts->first()->id,
			                        'body' => $posts->first()->body,
			                        'user_id' => $posts->first()->user_id,
			                        'created_at' => $posts->first()->created_at->diffForHumans(),

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
			}

	[5.6] Testing for friend
		php artisan make:test FriendTest

		#tests->Feature->FriendTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;

			use Carbon\Carbon;
			use App\User;
			use App\Friend;


			class FriendTest extends TestCase
			{
			    use RefreshDatabase;

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
			                'path' => url('/users/'.$friendRequest->friend_id)
			            ]
			        ]);
			    }

			    /** @test */
			    public function auth_user_can_accept_friend_request()
			    {
			        $this->withoutExceptionHandling();

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
			                'path' => url('/users/'.$friendRequest->friend_id)
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
			        $this->withoutExceptionHandling();

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
			        $this->withoutExceptionHandling();
			        $this->actingAs($user1 = factory(User::class)->create(), 'api'); //It just logs in the user

			        $user2 = factory(User::class)->create();

			        $this->post('/api/send-request', ['friend_id' => $user2->id])->assertStatus(200);

			        $this->post('/api/send-request', ['friend_id' => $user2->id])->assertStatus(200);

			        $friendRequest = Friend::all(); //To grab first row from the friend's table

			        $this->assertCount(1, $friendRequest);
			    }
			}

	[5.7] Testing for likes
		php artisan make:test LikeTest

		#tests->Feature->LikeTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;

			use App\Post;
			use App\User;


			class LikeTest extends TestCase
			{
			    use RefreshDatabase;

			    /** @test */
			    public function auth_user_can_like_a_post()
			    {
			        $this->withoutExceptionHandling();

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
			                    'path' => url('/posts/' . $post->id),
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
			        $this->withoutExceptionHandling();

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

			                    'likes' => [
			                        'data' => [
			                            [
			                                'created_at' => now()->diffForHumans(),
			                                'post_id' => $post->id,
			                                'path' => url('/posts/' . $post->id),
			                            ]
			                        ],
			                        'like_count' => 1,
			                        'user_liked' => true,
			                        'links' => [
			                            'self' => '/posts',
			                        ]
			                    ],

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
			}

	[5.8] Testing for image
		php artisan make:test ImageTest

		#tests->Feature->ImageTest
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Illuminate\Support\Facades\Storage;
			use Illuminate\Http\UploadedFile;
			use Tests\TestCase;

			use App\Post;
			use App\User;
			use App\Image;


			class ImageTest extends TestCase
			{
			    use RefreshDatabase;

			    protected function setUp(): void
			    {
			        parent::setUp();

			        Storage::fake('public');
			    }

			    /** @test */
			    public function auth_user_can_upload_image()
			    {
			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('image.jpg');

			        $response = $this->post('/api/upload-images', [
			            'image' => $file,
			            'width' => '850',
			            'height' => '300',
			            'type' => 'cover'
			        ])->assertStatus(201);

			        Storage::disk('public')->assertExists('uploadedImages/' . $file->hashName());

			        $image = Image::first();

			        $this->assertEquals('uploadedImages/' . $file->hashName(), $image->path);
			        $this->assertEquals('850', $image->width);
			        $this->assertEquals('300', $image->height);
			        $this->assertEquals('cover', $image->type);

			        $response->assertJson([
			            'data' => [
			                'id' => $image->id,
			                'path' => $image->path,
			                'width' => $image->width,
			                'height' => $image->height,
			                'type' => $image->type,
			            ]
			        ]);
			    }

			    /** @test */
			    public function users_are_fetched_with_their_images()
			    {
			        $this->withoutExceptionHandling();

			        $this->actingAs($user = factory(User::class)->create(), 'api'); //It just logs in the user

			        $file = UploadedFile::fake()->image('image.jpg');

			        $this->post('/api/upload-images', [
			            'image' => $file,
			            'width' => 850,
			            'height' => 300,
			            'type' => 'cover'
			        ])->assertStatus(201);

			        $this->post('/api/upload-images', [
			            'image' => $file,
			            'width' => 400,
			            'height' => 400,
			            'type' => 'profile'
			        ])->assertStatus(201);

			        $uploadedImages = Image::all();
			        $coverImage = $uploadedImages[0];
			        $profileImage = $uploadedImages[1];

			        $response = $this->get('/api/users/' . $user->id);

			        $response->assertJson([
			            [
			                'id' => $user->id,
			                'name' => $user->name,
			                'email' => $user->email,

			                'cover_image' => [
			                    'id' => $coverImage->id,
			                    'width' => $coverImage->width,
			                    'height' => $coverImage->height,
			                    'type' => $coverImage->type,
			                ],

			                'profile_image' => [
			                    'id' => $profileImage->id,
			                    'width' => $profileImage->width,
			                    'height' => $profileImage->height,
			                    'type' => $profileImage->type,
			                ]
			            ],
			            [
			                'data' =>[],
			                'links' => [
			                    'self' => '/posts'
			                ]
			            ]
			        ]);
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
				module.exports = {
				  purge: [
				    './resources/views/**/*.blade.php',
				    './resources/css/**/*.css',
				  ],
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

			let homeTitle = 'Sign Up';

			if(User.loggedIn()) {
			    homeTitle = 'NewsFeed'
			}

			Vue.use(VueRouter);

			export default new VueRouter({
			    routes: [
			        { path: '/', component: NewsFeed, meta:{title: homeTitle} },
			        { path: '/users/:userId', component: ShowUser, meta:{title: 'Profile'} },
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

			Vue.use(Vuex);

			export default new Vuex.Store({
			    modules: {
			        Auth,
			        Title,
			        Request,
			        Posts,
			        Comments
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
				            .then(res => {
				                commit('pushLikes', {likes: res.data, index: data.index})
				            })
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
				};

				export default {
				    state, getters, actions, mutations
				}

			#resources->js->store->modules->comments.js
				import Posts from './posts'

				const state = {
				    //Unlike posts, we will pass the body from the vue file as a parameter (Just to do it differently)
				    commentErrors: null,
				};

				const getters = {
				    commentErrors: state => {
				        return state.commentErrors;
				    },
				};

				const actions = {
				    createComment({commit, state}, data) {
				        axios.post('/api/posts/' + data.post_id + '/comments', {body: data.body})
				            .then(res => commit('pushComments', {comments: res.data, index: data.index}))
				            .catch(err => commit('setCommentErrors', err))
				    },

				    updateComment({commit, state}, data) {
				        axios.put('/api/posts/' + data.post_id + '/comments/' + data.comment_id, {body: data.comment_body})
				            .then(res => commit('pushComments', res.data))
				            .catch(err => commit('setPostErrors', err))
				    },

				    deleteComment({commit, state}, data) {
				        axios.delete('/api/posts/' + data.post_id + '/comments/' + data.comment_id)
				            .then(res => commit('spliceComment', data))
				            .catch(err => commit('setCommentErrors', err))
				    },
				};

				const mutations = {
				    setCommentErrors(state, err) {
				        state.commentErrors = err.response
				    },

				    pushComments(state, data) {
				        Posts.state.posts[data.index].comments = data.comments
				    },

				    spliceComment(state, data) {
				        Posts.state.posts[data.post_index].comments.data.splice(data.comment_index, 1)
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
				            <form @submit.prevent="dispatchLogin(loginForm)" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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

				                <div class="flex items-center justify-between">
				                    <button @click="dispatchLogin(loginForm)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none">Log In</button>

				                    <a @click="changeRegisterMode" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Click Here To Register!</a>
				                </div>
				            </form>
				        </div>
				    </div>
				</template>

				<script>
				    import { mapGetters } from 'vuex';

				    export default {
				        name: "Login",

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
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Auth->Register.vue
				<template>
				    <div class="flex h-screen items-center justify-center">
				        <div class="w-full max-w-xs">
				            <form @submit.prevent="dispatchRegister(registerForm)" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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

				                    <button @click="dispatchRegister(registerForm)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Register</button>
				                </div>
				            </form>
				        </div>
				    </div>
				</template/>

				<script>
				    import {mapGetters} from "vuex";

				    export default {
				        name: "Register",

				        data() {
				            return {
				                registerForm: {
				                    name: '',
				                    email: '',
				                    password: '',
				                    confirm_password: ''
				                }
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

				            dispatchRegister(registerForm) {
				                this.$store.dispatch('registerUser', registerForm)
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

				            <div class="w-2/3 overflow-x-hidden">
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
				    <div class="flex items-center bg-white h-12 border-b border-gray-400 shadow-sm">
				        <div class="flex justify-start items-center">
				            <router-link to="/" class="ml-12 mr-2 text-4xl text-blue-500">
				                <i class="fab fa-facebook"></i>
				            </router-link>

				            <div class="relative">
				                <div class="absolute mx-2 text-xl text-gray-600">
				                    <i class="fas fa-search"></i>
				                </div>
				                <input type="text" class="w-56 h-8 pl-10 text-sm rounded-full bg-gray-200 focus:outline-none focus:shadow-outline" placeholder="Search...">
				            </div>
				        </div>

				        <div class="w-full flex justify-center items-center h-full">
				            <router-link to="/" :class="homeButtonClass">
				                <i class="fas fa-home"></i>
				            </router-link>

				            <router-link :to="'/users/' + authUser.id" :class="profileButtonClass">
				                <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + authUser.profile_image.path" alt="Profile Image">
				            </router-link>

				            <router-link to="/" class="flex items-center h-full px-6 text-2xl border-b-2 border-white hover:border-blue-500 hover:text-blue-500">
				                <i class="fab fa-facebook-messenger"></i>
				            </router-link>
				        </div>

				        <div class="w-1/3 flex justify-end mr-12">
				            <router-link to="/" class="text-2xl">
				                <i class="fas fa-cog"></i>
				            </router-link>
				        </div>
				    </div>
				</template/>

				<script>
				    import { mapGetters } from 'vuex';

				    export default {
				        name: "Navbar",

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				                title: 'title'
				            }),

				            homeButtonClass() {
				                if(this.title == 'NewsFeed | Facebook') {
				                    return 'flex items-center h-full px-6 text-2xl border-b-2 border-blue-500 text-blue-500'
				                }
				                return 'flex items-center h-full px-6 text-2xl border-b-2 border-white hover:border-blue-500 hover:text-blue-500'
				            },

				            profileButtonClass() {
				                if(this.title == 'Profile | Facebook') {
				                    return 'flex items-center h-full px-6 text-2xl border-b-2 border-blue-500'
				                }
				                return 'flex items-center h-full px-6 text-2xl border-b-2 border-white hover:border-blue-500'
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Main->NewsFeed.vue
				<template>
				    <div class="flex flex-col items-center py-4">
				        <CreatePost />

				        <ShowPosts />
				    </div>
				</template>

				<script>
				    import CreatePost from "../Post/CreatePost";
				    import ShowPosts from "../Post/ShowPosts";

				    export default {
				        name: "NewsFeed",

				        components: {CreatePost, ShowPosts}
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
				    <div class="w-1/3 p-4 bg-white border-r-2 border-gray-400 shadow-sm">
				        <button @click="dispatchLogout" class="text-xl font-bold tracking-tight focus:outline-none"><i class="fas fa-sign-out-alt"></i> Logout</button>
				    </div>
				</template>

				<script>
				    export default {
				        name: "Sidebar",

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
				    <div class="w-2/3 p-4 bg-white shadow rounded">
				        <div class="flex justify-between items-center">
				            <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + authUser.profile_image.path" alt="Profile Image">

				            <input v-if="! editMode" v-model="body" type="text" class="flex-auto mx-4 h-8 pl-4 rounded-full bg-gray-200 focus:outline-none focus:shadow-outline" placeholder="Add a post">

				            <input v-else v-model="post.body" type="text" class="flex-auto mx-4 h-8 pl-4 rounded-full bg-gray-200 focus:outline-none focus:shadow-outline" placeholder="Add a post">

				            <div v-if="! editMode">
				                <transition name="fade">
				                    <button v-if="body" @click="postMessage" class="px-2 text-xl">
				                        <i class="fas fa-share"></i>
				                    </button>
				                </transition>
				            </div>

				            <div v-else>
				                <transition name="fade">
				                    <button v-if="post.body" @click="updateMessage(post), post.body=''" class="px-2 text-xl">
				                        <i class="fas fa-edit"></i>
				                    </button>
				                </transition>

				                <button @click="commitCancelEdit(post)" class="w-8 h-8 rounded-full text-xl bg-gray-200">
				                    <i class="far fa-window-close"></i>
				                </button>
				            </div>

				            <button ref="postImage" class="dz-clickable mx-2 w-8 h-8 rounded-full text-xl bg-gray-200 focus:outline-none">
				                <p class="dz-clickable"><i class="fas fa-image"></i></p>
				            </button>
				        </div>

				        <div v-if="editMode && post.single_picture">
				            <img :src="'/storage/' + post.single_picture.path" class="w-full h-full my-4" alt="">
				        </div>

				        <div v-if="editMode && post.multiple_pictures" class="flex">
				            <div v-for="picture in post.multiple_pictures.data" id="picture.id" class="mr-1 mt-5">
				                <img :src="'/storage/' + picture.path" alt="Post Picture">
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
				</template>

				<script>
				    import _ from "lodash";
				    import { mapGetters } from 'vuex';
				    import Dropzone from 'dropzone';

				    export default {
				        name: "CreatePost",

				        data() {
				            return {
				                editMode: false,
				                post: '',
				                originalPost: '',
				                dropzone: null,
				            }
				        },

				        mounted() {
				            this.dropzone = new Dropzone(this.$refs.postImage, this.settings);
				        },

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser'
				            }),

				            imageButtonClass() {
				                 if(this.editMode) {
				                     return 'hidden'
				                 } else {
				                     return 'dz-clickable mx-2 w-8 h-8 rounded-full text-xl bg-gray-200 focus:outline-none'
				                 }
				            },

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
				                return {
				                    paramName: 'image', //field name is image
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
				            postMessage() {
				                if (this.dropzone.getAcceptedFiles().length) {
				                    this.dropzone.processQueue()
				                } else {
				                    this.$store.dispatch('createPost')
				                }
				            },

				            updateMessage(post) {
				                this.editMode = false

				                if (this.dropzone.getAcceptedFiles().length) {
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
				    <div class="flex flex-col items-center py-4">
				        <p v-if="status == 'loading'">Loading Posts...</p>

				        <PostCard v-else v-for="(post, index) in posts" :key="index" :post="post"/>
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
				                status: 'postStatus'
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
				    <div class="w-2/3 p-4 bg-white rounded mt-6 shadow ">
				        <div >
				            <div class="flex justify-between items-center">
				                <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + post.posted_by.profile_image.path" alt="Profile Image">

				                <div class="flex-auto mx-4">
				                    <p class="text-sm font-bold">{{post.posted_by.name}}</p>
				                    <p class="text-xs text-gray-600">{{post.created_at}}</p>
				                </div>

				                <div class="dropdown inline-block relative">
				                    <button class="text-xl font-bold px-4 rounded items-center focus:outline-none">...</button>

				                    <ul class="dropdown-menu pt-1 absolute hidden text-gray-700 text-sm">
				                        <li><button @click="commitEditPost(post, $vnode.key)" class="w-24 py-2 px-4 block text-left rounded-t font-semibold bg-gray-400 hover:bg-gray-300 focus:outline-none">Edit</button></li>
				                        <li><button @click="dispatchDeletePost(post.id, $vnode.key)" class="w-24 py-2 px-4 block text-left rounded-b font-semibold bg-gray-400 hover:bg-gray-300 focus:outline-none">Delete</button></li>
				                    </ul>
				                </div>
				            </div>

				            <div class="mt-4">
				                <p>{{post.body}}</p>
				            </div>
				        </div>

				        <div v-if="post.single_picture">
				            <img :src="'/storage/' + post.single_picture.path" class="w-full h-full mt-2" alt="Post Picture">
				        </div>

				        <div v-if="post.multiple_pictures" class="flex">
				            <div v-for="picture in post.multiple_pictures.data" id="picture.id" class="mr-1 mt-2">
				                <img :src="'/storage/' + picture.path" alt="Post Picture">
				            </div>
				        </div>

				        <div class="flex justify-between p-4 text-sm">
				            <p><i class="far fa-thumbs-up text-blue-500 mr-1"></i>{{post.likes.like_count}} Likes</p>

				            <p>{{post.comments.comment_count}} Comments</p>
				        </div>

				        <div class="flex justify-between items-center m-4 border-1 border-gray-400">
				            <button @click="dispatchLikePost(post.id, $vnode.key)" :class="likeColor"><i class="far fa-thumbs-up mr-1"></i> Like</button>

				            <button @click="commentMode = ! commentMode" class="w-full hover:text-gray-600 focus:outline-none"><i class="far fa-comments mr-1"></i> Comments</button>
				        </div>

				        <div v-if="commentMode" class="flex border-t border-gray-400 p-4 py-2">
				            <input v-model='commentBody' type="text" name="comment" placeholder="Add your comment..." class="w-full pl-4 h-8 bg-gray-200 rounded-lg focus:outline-none">

				            <button v-if="commentBody" @click="dispatchAddComment(commentBody, post.id, $vnode.key), commentBody = ''"  class="bg-gray-200 ml-2 px-2 py-1 rounded-lg focus:outline-none">Post</button>
				        </div>

				        <div v-if="commentMode" v-for="(comment, index) in post.comments.data">
				            <CommentCard :comment="comment" :comment_index="index" :post_index="$vnode.key" />
				        </div>
				    </div>
				</template/>

				<script>
				    import CommentCard from "./CommentCard";

				    export default {
				        name: "PostCard",

				        components: {CommentCard},

				        props: ['post'],

				        data() {
				            return {
				                commentBody: '',
				                commentMode: false,
				            }
				        },

				        computed: {
				            likeColor() {
				                return this.post.likes.user_liked ? 'w-full text-blue-500 focus:outline-none' : 'w-full hover:text-blue-500 focus:outline-none'
				            }
				        },

				        methods: {
				            dispatchDeletePost(post_id, index) {
				                this.$store.dispatch('deletePost', {post_id, index})
				            },

				            dispatchLikePost(post_id, index) {
				                this.$store.dispatch('likeDislikePost', {post_id, index})
				            },

				            commitEditPost(post, index) {
				                this.$store.commit('splicePost', {post, index})

				                EventBus.$emit('changingEditMode', post)
				            },

				            dispatchAddComment(body, post_id, index) {
				                this.$store.dispatch('createComment', {body, post_id, index})
				            },
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
				    <div class="flex px-4 py-2 items-center">
				        <img class="w-8 h-8 object-cover rounded-full" :src="'/storage/' + comment.commented_by.profile_image.path" alt="Profile Image">

				        <div>
				            <div class="flex-auto ml-2 bg-gray-200 rounded-lg p-2 text-sm">
				                <router-link :to="'/users/' + comment.commented_by.id" class="font-bold text-blue-700">
				                    {{comment.commented_by.name}}
				                </router-link>

				                <p v-if="! commentEditMode" class="inline">{{comment.body}}</p>

				                <div v-else class="inline ml-2">
				                    <input v-model="comment.body" class="outline-none px-2 border border-gray-400"></input>

				                    <button @click="dispatchEditComment(comment.id, comment_index, comment.body, comment.post_id, post_index), commentEditMode = false" class="ml-2 text-gray-700 focus:outline-none"><i class="fas fa-check-circle"></i></button>

				                    <button @click="commentEditMode = false, comment.body = orginalCommentBody" class="ml-2 text-gray-700 focus:outline-none"><i class="fas fa-ban"></i></button>
				                </div>
				            </div>

				            <div class="flex text-xs">
				                <button @click="commentEditMode = ! commentEditMode" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Edit</button>

				                <button @click="dispatchDeleteComment(comment.id, comment_index, comment.post_id, post_index)" class="ml-4 font-medium text-blue-700 hover:font-semibold focus:outline-none">Delete</button>

				                <p class="ml-4 text-xs">{{comment.updated_at}}</p>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    export default {
				        name: "CommentCard",

				        props: ['comment', 'comment_index', 'post_index'],

				        data() {
				            return {
				                orginalCommentBody: this.comment.body,
				                commentEditMode: false,
				            }
				        },

				        methods: {
				            dispatchEditComment(comment_id, comment_index, comment_body, post_id, post_index) {
				                this.$store.dispatch('updateComment', {comment_id, comment_index, comment_body, post_id, post_index})
				            },

				            dispatchDeleteComment(comment_id, comment_index, post_id, post_index) {
				                this.$store.dispatch('deleteComment', {comment_id, comment_index, post_id, post_index})
				            }
				        }
				    }
				</script>

				<style scoped>

				</style>

			#resources->js->components->Extra->UploadableImage.vue
				<template>
				    <div>
				        <img :class="imageClass" :src="'/storage/' + imageObject.path" :alt="imageAlt" ref="userImage">
				    </div>
				</template>

				<script>
				    import Dropzone from 'dropzone';
				    import { mapGetters } from 'vuex';

				    export default {
				        name: "UploadableImage",

				        props: ['newImage', 'imageClass', 'imageAlt', 'imageWidth', 'imageHeight', 'imageType'],

				        data() {
				            return {
				                dropzone: null,
				                uploadedImage: null
				            }
				        },

				        mounted() {
				            if(this.authUser.id == this.$route.params.userId) {
				                this.dropzone = new Dropzone(this.$refs.userImage, this.settings);
				            }
				        },

				        computed: {
				            ...mapGetters({
				                authUser: 'authUser',
				            }),

				            settings() {
				                return {
				                    paramName: 'image', //field name is image
				                    url: '/api/upload-images',
				                    acceptedFiles: 'image/*',
				                    params: {
				                        'width': this.imageWidth,
				                        'height': this.imageHeight,
				                        'type' : this.imageType
				                    },
				                    headers: {
				                        //'X-CSRF-TOKEN': document.head.querySelector('meta[name=csrf-token]').content,

				                        'Authorization': `Bearer ${localStorage.getItem('token')}`
				                    },
				                    success: (e, res) => {
				                        //alert('uploaded!');
				                        /*  One Way

				                            this.cover_image = res will not work because we can not mutate the props.
				                            The image will change in the profile but not in posts, comments and navbar.

				                            this.uploadedImage = res.data
				                         */
				                        this.$store.dispatch('fetchAuthUser')
				                        this.$store.dispatch('fetchUser', this.$route.params.userId)
				                        this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
				                    }
				                };
				            },

				            //Tt is not required if we are dispatching events because as we are not changing uploadedImage, it will call this.newImage anyway. Just change it on the :scr at the top.
				            imageObject() {
				                return this.uploadedImage || this.newImage
				            }
				        }

				    }
				</script>

				<style scoped>

				</style>

		[7.3.5] User
			#resources->js->components->User->ShowUser.vue
				<template>
				    <div v-if="user">
				        <div class="relative">
				            <div class="w-100 h-64 overflow-hidden z-10">
				                <UploadableImage :newImage="user.cover_image" imageClass="object-cover w-full" imageAlt="Cover Image" imageWidth="1500" imageHeight="500" imageType="cover"/>
				            </div>

				            <div class="absolute flex items-center bottom-0 left-0 -mb-8 z-20 mx-4">
				                <UploadableImage :newImage="user.profile_image" imageClass="w-32 h-32 object-cover rounded-full shadow-lg border-4 border-gray-200" imageAlt="Profile Image" imageWidth="750" imageHeight="750" imageType="profile"/>

				                <p class="text-2xl text-gray-100 ml-3 shadow-2xl">{{user.name}}</p>
				            </div>

				            <div class="absolute flex items-center bottom-0 right-0 mb-4 z-20 mx-4">
				                <button v-if="friendButton && friendButton !== 'Accept'" @click="sendFriendRequest" class="py-1 px-3 bg-gray-400 rounded">
				                    <i class="fas fa-user-plus"></i> {{friendButton}}
				                </button>

				                <button v-if="friendButton && friendButton === 'Accept'" @click="acceptFriendRequest" class="py-1 px-3 bg-blue-500 mr-2 rounded">
				                    <i class="fas fa-user-check"></i> Accept
				                </button>

				                <button v-if="friendButton && friendButton === 'Accept'" @click="deleteFriendRequest" class="py-1 px-3 bg-gray-400 mr-2 rounded">
				                    <i class="fas fa-user-times"></i> Delete
				                </button>
				            </div>
				        </div>

				        <div class="flex flex-col items-center py-4">
				            <p v-if="status.posts == 'loading' && posts.length < 1">Loading Posts...</p>

				            <PostCard v-else v-for="(post, index) in posts" :key="index" :post="post"/>
				        </div>
				    </div>
				</template>

				<script>
				    import PostCard from "../Extra/PostCard";
				    import UploadableImage from "../Extra/UploadableImage";
				    import { mapGetters } from 'vuex'

				    export default {
				        name: "ShowUser",

				        components: {PostCard, UploadableImage},

				        computed: {
				            ...mapGetters({
				                user: 'user',
				                posts: 'posts',
				                friendButton: 'friendButton',
				                userErrors: 'userErrors',
				                status: 'status'
				            })
				        },

				        mounted() {
				            this.$store.dispatch('fetchUser', this.$route.params.userId)
				            this.$store.dispatch('fetchUserPosts', this.$route.params.userId)
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
				        }
				    }
				</script>

				<style scoped>

				</style>



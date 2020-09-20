1) Create a project
	laravel new birthdaySPA



2) Add Git repository
	[2.1] Cretae a repo on Git

	[2.2] Go to terminal of the project directory (VS Code)
		git init

		git add .

		git commit -m "Initial Commit"

		git remote add origin git@github.com:jay10596/Birthday-SPA.git

		#Follow this documentation to set ssh key if required
			https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

		git push -u origin master

			#OR

		git push origin master -f

		ssh password: password



3) Basic setup for the project
	[3.1] Installation
		composer require laravel/ui

		php artisan ui vue --auth

		npm install vue-router

		npm install && npm run dev

	[3.2] Make changes in routes to directly land on gome.blade.php
		#Edit routes in web.php
			#routes->web.php
				<?php

				use Illuminate\Support\Facades\Route;

				Auth::routes();

				Route::get('/{any}', 'HomeController@index')->where('any', '.*');

		#Comment out middleware in the HomeController 
			#app->Http->Controllers->HomeController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;

				class HomeController extends Controller
				{
				    public function __construct()
				    {
				        //$this->middleware('auth');
				    }

				    public function index()
				    {
				        return view('home');
				    }
				}

	[3.3] Load the vue app component
		#Remove extra code and add App component
			#resources->views->home.blade.php
				@extends('layouts.app')

				@section('content')
				<App/>
				@endsection

		#Create an App component
			#resources->js->components->App.vue
				<template>
				    <div>
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

		#Check if the Hello is displayed
			php artisan serve

			npm run watch

	[3.4] Generate the routes and display the components of those routes
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
					    <div>
					        <h1>Hello</h1>
					        <router-view></router-view>
					    </div>
					</template>

					<script>
					    export default {
					        name: "App",
					    }
					</script>

				#It should display ExampleComponent along with Hello



4) Setup mysql database
	[4.1] Open mysql and create the database
		#From the project's directory/VS code's terminal 	
			mysql

			create database birthdaySPA;

						OR

		#From root directory/Mac terminal
			mysql -u root

			create database birthdaySPA;

	[4.2] Use database birthdaySPA
		TablePlus -> Open database birthdaySPA

	[4.3] Edit .env file
		DB_DATABASE=birthdaySPA

	[4.4] Check if it works
		php artisan migrate



5) Create basic backend scaffolding for Contact
	[5.1] Make the mfr of contactwhich will be used in the test
    		php artisan make:model Model/Contact -mfr

    	#Add guarded in the Model
    		#app->Model->Contact
    			<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;

				class Contact extends Model
				{
				    protected $guarded = [];
				}

		#Add name column in the Migration
			#database->migration->create_contacts_table
				public function up()
			    {
			        Schema::create('contacts', function (Blueprint $table) {
			            $table->id();
			            $table->string('name');
			            $table->string('email');
			            $table->string('birthday');
			            $table->string('company');
			            $table->timestamps();
			        });
			    }

		#Add Contact route in Api
			#routes->api.php
				Route::post('/contacts', 'ContactController@store');

		#Add values in the store function of the Controller
			#app->Http->Controllers->ContactController
				public function store(Request $request)
			    {
			        Contact::create([
			            'name' => request('name'),
			            'email' => request('email'),
			            'birthday' => request('birthday'),
			            'company' => request('company')
			        ]);

			        #OR

			        Contact::create($request->all());

			        #OR

			        $contact = new Contact;

			        $contact->name  = $request->name;
	        		$contact->email  = $request->email;
	        		$contact->birthday  = $request->birthday;
	        		$contact->company  = $request->company;

			        $contact->save();
			    }

		#Add values in ContactFactory
			#database->factories->ContactFactory
				$factory->define(Contact::class, function (Faker $faker) {
				    return [
				        'name' => $faker->name,
				        'email' => $faker->email,
				        'birthday' => '05/10/1996',
				        'company' => $faker->company
				    ];
				});



6) Implement testing
	[6.1] Setup tetsing enviornment
		#Make sure connection is set to sqlite
			#phpunit.xml
				<server name="DB_CONNECTION" value="sqlite"/>
        		<server name="DB_DATABASE" value=":memory:"/>

        	#run the pre-existing tests of tests->Feature & Unit
        		vendor/bin/phpunit

        	#Modify the command to avoid writing the whole command
        		alias pu="clear && vendor/bin/phpunit"  
        		alias pf="clear && vendor/bin/phpunit --filter"  	

	[6.2] Create first test
		#Genrate the test file
    		php artisan make:test ContactsTest

    	#Write the first test function
    		#tests->Feature->ContactTest
    			<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use app\Model\Contact;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '10/5/1996',
				            'company' => 'Telecom '
				        ]);

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '10/5/1996',
				            'company' => 'Telecom '
				            ]);

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }
				}

		pu 

	[6.3] Test using validattion
		#Add validation in the ContactController
			#app->Http->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;

				class ContactController extends Controller
				{
				    public function index()
				    {
				        //
				    }

				    public function create()
				    {
				        //
				    }

				    public function store(Request $request)
				    {
				        $data = request()->validate([
				            'name' => 'required',
				            'email' => '',
				            'birthday' => '',
				            'company' => ''
				        ]);

				        Contact::create($data);
				    }

				    public function show(Contact $contact)
				    {
				        //
				    }

				    public function edit(Contact $contact)
				    {
				        //
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        // 
				    }

				    public function destroy(Contact $contact)
				    {
				        //
				    }
				}	

		#Add new function in the test file
			#tests->Feature->ContactTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use app\Model\Contact;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '10/5/1996',
				            'company' => 'Telecom '
				        ]);

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '10/5/1996',
				            'company' => 'Telecom '
				        ]);

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', [
				            'email' => 'user@test.com',
				            'birthday' => '10/5/1996',
				            'company' => 'Telecom '
				        ]);

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    }

				    
				}

	[6.4] Refector test cases
		#Create a new function to store the values of post request
			<?php

			namespace Tests\Feature;

			use Illuminate\Foundation\Testing\RefreshDatabase;
			use Illuminate\Foundation\Testing\WithFaker;
			use Tests\TestCase;

			use app\Model\Contact;

			class ContactsTest extends TestCase
			{
			    use RefreshDatabase;

			    private function data()
			    {
			        return [
			            'name' => 'User',
			            'email' => 'user@test.com',
			            'birthday' => '10/5/1996',
			            'company' => 'Telecom '
			        ];
			    }

			    /** @test */
			    public function contactCreatedCount()
			    {
			        $this->withoutExceptionHandling();

			        $this->post('/api/contacts', $this->data());

			        $this->assertCount(1, Contact::all());
			    }
			                    
			    /** @test */
			    public function contactCreatedEquals()
			    {
			        $this->withoutExceptionHandling();

			        $this->post('/api/contacts', $this->data());

			        $contact = Contact::first();
			        
			        $this->assertEquals('User', $contact->name);
			        $this->assertEquals('user@test.com', $contact->email);
			        $this->assertEquals('Telecom', $contact->company);
			    }

			    /** @test */
			    public function nameRequiredSessionErrors()
			    {
			        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

			        $contact = Contact::first();
			        
			        $response->assertSessionHasErrors('name');
			        $this->assertCount(0, Contact::all());
			    } 
			}

	[6.5] Test case loop for the simiar test cases
		#Add validation in the ContactController to the rest of the fields
			#app->Http->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;

				class ContactController extends Controller
				{
				    public function index()
				    {
				        //
				    }

				    public function create()
				    {
				        //
				    }

				    public function store(Request $request)
				    {
				        $data = request()->validate([
				            'name' => 'required',
				            'email' => 'required',
				            'birthday' => 'required',
				            'company' => 'required'
				        ]);

				        Contact::create($data);
				    }

				    public function show(Contact $contact)
				    {
				        //
				    }

				    public function edit(Contact $contact)
				    {
				        //
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        // 
				    }

				    public function destroy(Contact $contact)
				    {
				        //
				    }
				}	

		#Add new function in the test file
			#tests->Feature->ContactTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use app\Model\Contact;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    private function data()
				    {
				        return [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '10/5/1996',
				            'company' => 'Telecom '
				        ];
				    }

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    } 

				    /** @test */
				    public function fieldsRequiredSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors($field);
				                $this->assertCount(0, Contact::all());
				            });
				    }
				}

	[6.5] Validate email and birthday fields properly
		#Add email validation in the ContactController
			#app->Http->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;

				class ContactController extends Controller
				{
				    public function index()
				    {
				        //
				    }

				    public function create()
				    {
				        //
				    }

				    public function store(Request $request)
				    {
				        $data = request()->validate([
				            'name' => 'required',
				            'email' => 'required|email',
				            'birthday' => 'required',
				            'company' => 'required'
				        ]);

				        Contact::create($data);
				    }

				    public function show(Contact $contact)
				    {
				        //
				    }

				    public function edit(Contact $contact)
				    {
				        //
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        // 
				    }

				    public function destroy(Contact $contact)
				    {
				        //
				    }
				}	
				
		#Change the datatype of date to timestamp
			#database->migration->create_contacts_table
				public function up()
			    {
			        Schema::create('contacts', function (Blueprint $table) {
			            $table->id();
			            $table->string('name');
			            $table->string('email');
			            $table->timestamp('birthday');
			            $table->string('company');
			            $table->timestamps();
			        });
			    }

		#Parse date using Carbon in the Model
			#app->model->Contact
				<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;
				use Carbon\Carbon;

				class Contact extends Model
				{
				    protected $guarded = [];

				    protected $dates = ['birthday'];

				    public function setBirthdayAttribute($birthday)
				    {
				        $this->attributes['birthday'] = Carbon::parse($birthday);
				    }
				}

		#Add respective test cases
			#test->Feature->ContactTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use App\Model\Contact;
				use Carbon\Carbon;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    private function data()
				    {
				        return [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '05/10/1996',
				            'company' => 'Telecom '
				        ];
				    }

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    } 

				    /** @test */
				    public function fieldsRequired()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors($field);
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validEmail()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors('email');
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validBirthdayInstanceOf()
				    {
				        $this->withoutExceptionHandling();

				        $response = $this->post('/api/contacts', array_merge($this->data()));
				        
				        $this->assertCount(1, Contact::all());
				        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
				        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
				    }
				}

	[6.6] Test a single contact
		#Make the route to display single contact
			#routes->api
				Route::get('/contacts/{contact}', 'ContactController@show');
				Route::post('/contacts', 'ContactController@store');

		#Edit show() in the ContactController
			#app->Http->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;

				class ContactController extends Controller
				{
				    public function index()
				    {
				        //
				    }

				    public function create()
				    {
				        //
				    }

				    public function store(Request $request)
				    {
				        $data = request()->validate([
				            'name' => 'required',
				            'email' => 'required',
				            'birthday' => 'required',
				            'company' => 'required'
				        ]);

				        Contact::create($data);
				    }

				    public function show(Contact $contact)
				    {
				        return $contact;
				    }

				    public function edit(Contact $contact)
				    {
				        //
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        // 
				    }

				    public function destroy(Contact $contact)
				    {
				        //
				    }
				}	

		#Add respective test case
			#test->Feature->ContactTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use App\Model\Contact;
				use Carbon\Carbon;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    private function data()
				    {
				        return [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '05/10/1996',
				            'company' => 'Telecom '
				        ];
				    }

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    } 

				    /** @test */
				    public function fieldsRequiredSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors($field);
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validEmailSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors('email');
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validBirthdayInstanceOf()
				    {
				        $this->withoutExceptionHandling();

				        $response = $this->post('/api/contacts', array_merge($this->data()));
				        
				        $this->assertCount(1, Contact::all());
				        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
				        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
				    }

				    /** @test */
				    public function singleContactJson()
				    {
				        $contact = factory('App\Model\Contact')->create();
				        //dd($contact);
				        $response = $this->get('api/contacts/' . $contact->id);
				    
				        $response->assertJson([
				            'name' => $contact->name,
				            'email' => $contact->email,
				            'birthday' => '1996-05-10T00:00:00.000000Z',
				            'company' => $contact->company,
				        ]);
				    }
				}



	[6.7] Update a contact
			#Make the route to update a contact
				#routes->api
					Route::get('/contacts/{contact}', 'ContactController@show');
					Route::post('/contacts', 'ContactController@store');
					Route::put('/contacts/{contact}', 'ContactController@update');

			#Edit update() and refactor ContactController to make validate common function
				#app->Http->Controllers->ContactController
					<?php

					namespace App\Http\Controllers;

					use App\Model\Contact;
					use Illuminate\Http\Request;

					class ContactController extends Controller
					{
					    private function validateData()
					    {
					        return request()->validate([
					            'name' => 'required',
					            'email' => 'required|email',
					            'birthday' => 'required',
					            'company' => 'required'
					        ]);
					    }

					    public function index()
					    {
					        //
					    }

					    public function create()
					    {
					        //
					    }

					    public function store(Request $request)
					    {
					        Contact::create($this->validateData());
					    }

					    public function show(Contact $contact)
					    {
					        return $contact;
					    }

					    public function edit(Contact $contact)
					    {
					        //
					    }

					    public function update(Request $request, Contact $contact)
					    {
					        $contact->update($this->validateData()); 
					    }

					    public function destroy(Contact $contact)
					    {
					        //
					    }
					}

			#Add respective test case
				#test->Feature->ContactTest
					<?php

					namespace Tests\Feature;

					use Illuminate\Foundation\Testing\RefreshDatabase;
					use Illuminate\Foundation\Testing\WithFaker;
					use Tests\TestCase;

					use App\Model\Contact;
					use Carbon\Carbon;

					class ContactsTest extends TestCase
					{
					    use RefreshDatabase;

					    private function data()
					    {
					        return [
					            'name' => 'User',
					            'email' => 'user@test.com',
					            'birthday' => '05/10/1996',
					            'company' => 'Telecom '
					        ];
					    }

					    /** @test */
					    public function contactCreatedCount()
					    {
					        $this->withoutExceptionHandling();

					        $this->post('/api/contacts', $this->data());

					        $this->assertCount(1, Contact::all());
					    }
					                    
					    /** @test */
					    public function contactCreatedEquals()
					    {
					        $this->withoutExceptionHandling();

					        $this->post('/api/contacts', $this->data());

					        $contact = Contact::first();
					        
					        $this->assertEquals('User', $contact->name);
					        $this->assertEquals('user@test.com', $contact->email);
					        $this->assertEquals('Telecom', $contact->company);
					    }

					    /** @test */
					    public function nameRequiredSessionErrors()
					    {
					        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

					        $contact = Contact::first();
					        
					        $response->assertSessionHasErrors('name');
					        $this->assertCount(0, Contact::all());
					    } 

					    /** @test */
					    public function fieldsRequiredSessionErrors()
					    {
					        collect(['name', 'email', 'birthday', 'company'])
					            ->each(function($field){
					                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

					                $contact = Contact::first();
					                
					                $response->assertSessionHasErrors($field);
					                $this->assertCount(0, Contact::all());
					            });
					    }

					    /** @test */
					    public function validEmailSessionErrors()
					    {
					        collect(['name', 'email', 'birthday', 'company'])
					            ->each(function($field){
					                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

					                $contact = Contact::first();
					                
					                $response->assertSessionHasErrors('email');
					                $this->assertCount(0, Contact::all());
					            });
					    }

					    /** @test */
					    public function validBirthdayInstanceOf()
					    {
					        $this->withoutExceptionHandling();

					        $response = $this->post('/api/contacts', array_merge($this->data()));
					        
					        $this->assertCount(1, Contact::all());
					        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
					        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
					    }

					    /** @test */
					    public function singleContactJson()
					    {
					        $contact = factory('App\Model\Contact')->create();
					        //dd($contact);
					        $response = $this->get('api/contacts/' . $contact->id);
					    
					        $response->assertJson([
					            'name' => $contact->name,
					            'email' => $contact->email,
					            'birthday' => '1996-05-10T00:00:00.000000Z',
					            'company' => $contact->company,
					        ]);
					    }

					    /** @test */
					    public function editContactEquals()
					    {
					        $contact = factory('App\Model\Contact')->create();

					        $response = $this->put('api/contacts/' . $contact->id, $this->data());
					    
					        $contact = $contact->fresh();

					        $this->assertEquals('User', $contact->name);
					        $this->assertEquals('user@test.com', $contact->email);
					        $this->assertEquals('05/10/1996', $contact->birthday->format('m/d/Y'));
					        $this->assertEquals('Telecom', $contact->company);
					    }
					}


	[6.8] Delete a contact
			#Make the route to delete a contact
				#routes->api
					Route::get('/contacts/{contact}', 'ContactController@show');
					Route::post('/contacts', 'ContactController@store');
					Route::put('/contacts/{contact}', 'ContactController@update');
					Route::delete('/contacts/{contact}', 'ContactController@destroy');

			#Edit destroy() in ContactController
				#app->Http->Controllers->ContactController
					<?php

					namespace App\Http\Controllers;

					use App\Model\Contact;
					use Illuminate\Http\Request;

					class ContactController extends Controller
					{
					    private function validateData()
					    {
					        return request()->validate([
					            'name' => 'required',
					            'email' => 'required|email',
					            'birthday' => 'required',
					            'company' => 'required'
					        ]);
					    }

					    public function index()
					    {
					        //
					    }

					    public function create()
					    {
					        //
					    }

					    public function store(Request $request)
					    {
					        Contact::create($this->validateData());
					    }

					    public function show(Contact $contact)
					    {
					        return $contact;
					    }

					    public function edit(Contact $contact)
					    {
					        //
					    }

					    public function update(Request $request, Contact $contact)
					    {
					        $contact->update($this->validateData()); 
					    }

					    public function destroy(Contact $contact)
					    {
					        $contact->delete();
					    }
					}

			#Add respective test case and edit anme so fthe existing test cases
					#test->Feature->ContactTest
						<?php

						namespace Tests\Feature;

						use Illuminate\Foundation\Testing\RefreshDatabase;
						use Illuminate\Foundation\Testing\WithFaker;
						use Tests\TestCase;

						use App\Model\Contact;
						use Carbon\Carbon;

						class ContactsTest extends TestCase
						{
						    use RefreshDatabase;

						    private function data()
						    {
						        return [
						            'name' => 'User',
						            'email' => 'user@test.com',
						            'birthday' => '05/10/1996',
						            'company' => 'Telecom '
						        ];
						    }

						    /** @test */
						    public function contactCreatedCount()
						    {
						        $this->withoutExceptionHandling();

						        $this->post('/api/contacts', $this->data());

						        $this->assertCount(1, Contact::all());
						    }
						                    
						    /** @test */
						    public function contactCreatedEquals()
						    {
						        $this->withoutExceptionHandling();

						        $this->post('/api/contacts', $this->data());

						        $contact = Contact::first();
						        
						        $this->assertEquals('User', $contact->name);
						        $this->assertEquals('user@test.com', $contact->email);
						        $this->assertEquals('Telecom', $contact->company);
						    }

						    /** @test */
						    public function nameRequiredSessionErrors()
						    {
						        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

						        $contact = Contact::first();
						        
						        $response->assertSessionHasErrors('name');
						        $this->assertCount(0, Contact::all());
						    } 

						    /** @test */
						    public function fieldsRequiredSessionErrors()
						    {
						        collect(['name', 'email', 'birthday', 'company'])
						            ->each(function($field){
						                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

						                $contact = Contact::first();
						                
						                $response->assertSessionHasErrors($field);
						                $this->assertCount(0, Contact::all());
						            });
						    }

						    /** @test */
						    public function validEmailSessionErrors()
						    {
						        collect(['name', 'email', 'birthday', 'company'])
						            ->each(function($field){
						                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

						                $contact = Contact::first();
						                
						                $response->assertSessionHasErrors('email');
						                $this->assertCount(0, Contact::all());
						            });
						    }

						    /** @test */
						    public function validBirthdayInstanceOf()
						    {
						        $this->withoutExceptionHandling();

						        $response = $this->post('/api/contacts', array_merge($this->data()));
						        
						        $this->assertCount(1, Contact::all());
						        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
						        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
						    }

						    /** @test */
						    public function singleContactJson()
						    {
						        $contact = factory('App\Model\Contact')->create();
						        //dd($contact);
						        $response = $this->get('api/contacts/' . $contact->id);
						    
						        $response->assertJson([
						            'name' => $contact->name,
						            'email' => $contact->email,
						            'birthday' => '1996-05-10T00:00:00.000000Z',
						            'company' => $contact->company,
						        ]);
						    }

						    /** @test */
						    public function editContactEquals()
						    {
						        $contact = factory('App\Model\Contact')->create();

						        $response = $this->put('api/contacts/' . $contact->id, $this->data());
						    
						        $contact = $contact->fresh();

						        $this->assertEquals('User', $contact->name);
						        $this->assertEquals('user@test.com', $contact->email);
						        $this->assertEquals('05/10/1996', $contact->birthday->format('m/d/Y'));
						        $this->assertEquals('Telecom', $contact->company);
						    }

						    /** @test */
						    public function deleteContactCount()
						    {
						        $contact = factory('App\Model\Contact')->create();

						        $response = $this->delete('api/contacts/' . $contact->id);
						    
						        $this->assertCount(0, Contact::all());
						    }
						}

	[6.9] Add middleware to all the existing test cases			
		#Add existing routes into a middelware group
			#routes->api
				<?php

				use Illuminate\Http\Request;
				use Illuminate\Support\Facades\Route;

				Route::middleware('auth:api')->group(function () {
				    Route::get('/contacts/{contact}', 'ContactController@show');
				    Route::post('/contacts', 'ContactController@store');
				    Route::put('/contacts/{contact}', 'ContactController@update');
				    Route::delete('/contacts/{contact}', 'ContactController@destroy');
				});

		#Add new api_token colum in the Migration
			#database->migrations->create_users_table
				public function up()
			    {
			        Schema::create('users', function (Blueprint $table) {
			            $table->id();
			            $table->string('name');
			            $table->string('email')->unique();
			            $table->timestamp('email_verified_at')->nullable();
			            $table->string('password');
			            $table->rememberToken();
			            $table->string('api_token');
			            $table->timestamps();
			        });
			    }

		#Add a fake api_token using factory
			#database->factories->UserFactory
				$factory->define(User::class, function (Faker $faker) {
				    return [
				        'name' => $faker->name,
				        'email' => $faker->unique()->safeEmail,
				        'email_verified_at' => now(),
				        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
				        'remember_token' => Str::random(10),
				        'api_token' => Str::random(30),
				    ];
				});

		#Pass the token in the respective tests
			#tests->Feature->ContactTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use App\Model\Contact;
				use App\User;
				use Carbon\Carbon;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    protected $user;

				    protected function setUp(): void 
				    {
				        parent::setUp();

				        $this->user = factory('App\User')->create();
				    }

				    private function data()
				    {
				        return [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '05/10/1996',
				            'company' => 'Telecom',
				            'api_token' => $this->user->api_token
				        ];
				    }

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    } 

				    /** @test */
				    public function fieldsRequiredSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors($field);
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validEmailSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors('email');
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validBirthdayInstanceOf()
				    {
				        $this->withoutExceptionHandling();

				        $response = $this->post('/api/contacts', array_merge($this->data()));
				        
				        $this->assertCount(1, Contact::all());
				        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
				        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
				    }

				    /** @test */
				    public function singleContactJson()
				    {
				        $contact = factory('App\Model\Contact')->create();
				        //dd($contact);
				        $response = $this->get('api/contacts/' . $contact->id. '?api_token=' . $this->user->api_token);
				    
				        $response->assertJson([
				            'name' => $contact->name,
				            'email' => $contact->email,
				            'birthday' => '1996-05-10T00:00:00.000000Z',
				            'company' => $contact->company,
				        ]);
				    }

				    /** @test */
				    public function editContactEquals()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $response = $this->put('api/contacts/' . $contact->id . '?api_token=' . $this->user->api_token, $this->data());
				        
				        $contact = $contact->fresh();

				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('05/10/1996', $contact->birthday->format('m/d/Y'));
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */ #Differeny way to add API token
				    public function deleteContactCount()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $response = $this->delete('api/contacts/' . $contact->id, ['api_token' => $this->user->api_token]);
				    
				        $this->assertCount(0, Contact::all());
				    }

				    /** @test */ #Differeny way to add API token
				    public function redirectUnauthenticated()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['api_token' => '']));
				    
				        $response->assertRedirect('/login');

				        $this->assertCount(0, Contact::all());
				    }
				}

	[6.9] Modift tests for authenticated user	
		#Add the get route for all questions of authenticated user
			#routes->api		
				Route::middleware('auth:api')->group(function () {
				    Route::get('/contacts', 'ContactController@index');
				    Route::get('/contacts/{contact}', 'ContactController@show');
				    Route::post('/contacts', 'ContactController@store');
				    Route::put('/contacts/{contact}', 'ContactController@update');
				    Route::delete('/contacts/{contact}', 'ContactController@destroy');
				});

		#Create a relationship between User and Contact
			#app->Model->Contact
				<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;
				use Carbon\Carbon;
				use App\User;

				class Contact extends Model
				{
				    protected $guarded = [];

				    protected $dates = ['birthday'];

				    public function setBirthdayAttribute($birthday)
				    {
				        $this->attributes['birthday'] = Carbon::parse($birthday);
				    }

				    public function user()
				    {
				        return $this->belongsTo(User::class);
				    }
				}

			#app->Model->User
				<?php

				namespace App;

				use Illuminate\Contracts\Auth\MustVerifyEmail;
				use Illuminate\Foundation\Auth\User as Authenticatable;
				use Illuminate\Notifications\Notifiable;
				use App\Model\Contact;

				class User extends Authenticatable
				{
				    use Notifiable;

				    protected $fillable = [
				        'name', 'email', 'password',
				    ];

				    protected $hidden = [
				        'password', 'remember_token',
				    ];

				    protected $casts = [
				        'email_verified_at' => 'datetime',
				    ];

				    public function contacts()
				    {
				        return $this->hasMany(Contact::class);
				    }
				}

		#Add the foreign key in the contact migration
			#database->migrations->create_contacts_table
				public function up()
			    {
			        Schema::create('contacts', function (Blueprint $table) {
			            $table->id();
			            $table->string('name');
			            $table->string('email');
			            $table->timestamp('birthday');
			            $table->string('company');
			            $table->timestamps();
			            $table->unsignedBigInteger('user_id');

			            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
			        });
			    }

		#Add Foreign Key in the ContactFactory
			#database->factories->ContactFactory
				<?php

				/** @var \Illuminate\Database\Eloquent\Factory $factory */

				use App\Model\Contact;
				use App\User;
				use Faker\Generator as Faker;

				$factory->define(Contact::class, function (Faker $faker) {
				    return [
				        'name' => $faker->name,
				        'email' => $faker->email,
				        'birthday' => '05/10/1996',
				        'company' => $faker->company,
				        'user_id' => factory(User::class) //It will create a new user
				    ];
				});

		#Modify functions in the Controller
			#app->Http->->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;
				use App\User;

				class ContactController extends Controller
				{
				    private function validateData()
				    {
				        return request()->validate([
				            'name' => 'required',
				            'email' => 'required|email',
				            'birthday' => 'required',
				            'company' => 'required'
				        ]);
				    }

				    public function index()
				    {
				        return request()->user()->contacts;
				    }

				    public function store(Request $request)
				    {
				        request()->user()->contacts()->create($this->validateData());
				    }

				    public function show(Contact $contact)
				    {
				        if(request()->user()->isNot($contact->user))
				        {
				            return response([], 403);
				        }

				        return $contact;
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        if(request()->user()->isNot($contact->user))
				        {
				            return response([], 403);
				        }

				        $contact->update($this->validateData()); 
				    }

				    public function destroy(Contact $contact)
				    {
				        if(request()->user()->isNot($contact->user))
				        {
				            return response([], 403);
				        }
				        
				        $contact->delete();
				    }
				}

		#Modify tests in the test file
			#tests->Feature->ContactsTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use App\Model\Contact;
				use App\User;
				use Carbon\Carbon;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    protected $user;

				    protected function setUp(): void 
				    {
				        parent::setUp();

				        $this->user = factory('App\User')->create();
				    }

				    private function data()
				    {
				        return [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '05/10/1996',
				            'company' => 'Telecom',
				            'api_token' => $this->user->api_token
				        ];
				    }

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    } 

				    /** @test */
				    public function fieldsRequiredSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors($field);
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validEmailSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors('email');
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validBirthdayInstanceOf()
				    {
				        $this->withoutExceptionHandling();

				        $response = $this->post('/api/contacts', array_merge($this->data()));
				        
				        $this->assertCount(1, Contact::all());
				        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
				        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
				    }

				    /** @test */
				    public function singleContactJson()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);
				        //dd($contact);
				        $response = $this->get('api/contacts/' . $contact->id. '?api_token=' . $this->user->api_token);
				    
				        $response->assertJson([
				            'name' => $contact->name,
				            'email' => $contact->email,
				            'birthday' => '1996-05-10T00:00:00.000000Z',
				            'company' => $contact->company,
				            'user_id' => $contact->user_id,
				        ]);
				    }

				    /** @test */
				    public function singleContactAuthenticatedJson()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);
				        
				        $user2 = factory('App\User')->create();

				        $response = $this->get('api/contacts/' . $contact->id . '?api_token=' . $user2->api_token);
				    
				        $response->assertStatus(403);
				    }

				    /** @test */
				    public function editContactEquals()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $response = $this->put('api/contacts/' . $contact->id . '?api_token=' . $this->user->api_token, $this->data());
				        
				        $contact = $contact->fresh();

				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('05/10/1996', $contact->birthday->format('m/d/Y'));
				        $this->assertEquals('Telecom', $contact->company);
				    }

				    /** @test */
				    public function editContactAuthenticatedEquals()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $user2 = factory('App\User')->create();
				        
				        $response = $this->put('api/contacts/' . $contact->id . '?api_token=' . $user2->api_token, $this->data());
				        
				        $response->assertStatus(403);
				    }

				    /** @test */ //Differeny way to add API token
				    public function deleteContactCount()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $response = $this->delete('api/contacts/' . $contact->id, ['api_token' => $this->user->api_token]);
				    
				        $this->assertCount(0, Contact::all());
				    }

				    /** @test */ //Differeny way to add API token
				    public function deleteContactAuthenticatedCount()
				    { 
				        $contact = factory('App\Model\Contact')->create();

				        $response = $this->delete('api/contacts/' . $contact->id, ['api_token' => $this->user->api_token]);
				    
				        $response->assertStatus(403);

				        //it gives the 403 error because in the create() userid is not passed which means in the factory User::class will create a new user with id 2 and we are passing the api token of user 1)
				    }

				    /** @test */ //Differeny way to add API token
				    public function redirectUnauthenticated()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['api_token' => '']));
				    
				        $response->assertRedirect('/login');

				        $this->assertCount(0, Contact::all());
				    }

				    /** @test */
				    public function allContactsOfAuthUser()
				    {
				        $this->withoutExceptionHandling();

				        $user1 = factory('App\User')->create();
				        $user2 = factory('App\User')->create();

				        $contact1 = factory('App\Model\Contact')->create(['user_id' => $user1->id]);
				        $contact2 = factory('App\Model\Contact')->create(['user_id' => $user2->id]);

				        $response = $this->get('/api/contacts?api_token=' . $user1->api_token);
				    
				        $response->assertJsonCount(1)->assertJson([['id' => $contact1->id]]);
				    }
				}

	[6.10] Make Policy to refector ContactController
		#Create the ContactPolicy
			php artisan make:policy ContactPolicy -m Contact

		#Add policies in the functions of ContactPolicy
			#app->Policies->ContactPolicy
				<?php

				namespace App\Policies;

				use App\Contact;
				use App\User;
				use Illuminate\Auth\Access\HandlesAuthorization;

				class ContactPolicy
				{
				    use HandlesAuthorization;

				    public function viewAny(User $user)
				    {
				        return true;
				    }

				    public function view(User $user, Contact $contact)
				    {
				        return $user->id == $contact->user_id;
				    }

				    public function create(User $user)
				    {
				        return true;
				    }

				    public function update(User $user, Contact $contact)
				    {
				        return $user->id == $contact->user_id;
				    }

				    public function delete(User $user, Contact $contact)
				    {
				        return $user->id == $contact->user_id;
				    }

				    public function restore(User $user, Contact $contact)
				    {
				        //
				    }

				    public function forceDelete(User $user, Contact $contact)
				    {
				        //
				    }
				}

		#Refector the ContactController
			#app->Http->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;
				use App\User;

				class ContactController extends Controller
				{
				    private function validateData()
				    {
				        return request()->validate([
				            'name' => 'required',
				            'email' => 'required|email',
				            'birthday' => 'required',
				            'company' => 'required'
				        ]);
				    }

				    public function index()
				    {
				        $this->authorize('viewAny', Contact::class);

				        return request()->user()->contacts;
				    }

				    public function store(Request $request)
				    {
				        $this->authorize('create', Contact::class);

				        request()->user()->contacts()->create($this->validateData());
				    }

				    public function show(Contact $contact)
				    {
				        $this->authorize('view', $contact);

				        return $contact;
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        $this->authorize('update', $contact);

				        $contact->update($this->validateData()); 
				    }

				    public function destroy(Contact $contact)
				    {
				        $this->authorize('delete', $contact);
				        
				        $contact->delete();
				    }
				}

	[6.10] Make Contact Resource to refactor data
		#Generate ContactResource file
			php artisan make:resource ContactResource

		#Edit the ContactResource file
			#app->Http->Resources->ContactResource
				<?php

				namespace App\Http\Resources;

				use Illuminate\Http\Resources\Json\JsonResource;
				use Carbon\Carbon;

				class ContactResource extends JsonResource
				{
				    public function toArray($request)
				    {
				        return [
				            'data' => [
				                'id' => $this->id,
				                'name' => $this->name,
				                'email' => $this->email,
				                'birthday' => $this->birthday->format('d.m.Y'),
				                'company' => $this->company,
				                'last_updated' => $this->updated_at->diffForHumans(),   
				            ],
				            'links' =>  [
				                'self' => $this->path()
				            ]
				        ];
				    }
				}

		#Add path() in the Contact Model
			#app->Model->Contact
				<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;
				use Carbon\Carbon;
				use App\User;

				class Contact extends Model
				{
				    protected $guarded = [];

				    protected $dates = ['birthday'];

				    public function setBirthdayAttribute($birthday)
				    {
				        $this->attributes['birthday'] = Carbon::parse($birthday);
				    }

				    public function user()
				    {
				        return $this->belongsTo(User::class);
				    }

				    public function path()
				    {
				        return url('/contacts/' . $this->id);
				    }
				}

		#Modify the ContactController
			#app->Http->Controllers->ContactController
				<?php

				namespace App\Http\Controllers;

				use App\Model\Contact;
				use Illuminate\Http\Request;
				use App\User;
				use App\Http\Resources\ContactResource;

				class ContactController extends Controller
				{
				    private function validateData()
				    {
				        return request()->validate([
				            'name' => 'required',
				            'email' => 'required|email',
				            'birthday' => 'required',
				            'company' => 'required'
				        ]);
				    }

				    public function index()
				    {
				        return ContactResource::collection(request()->user()->contacts);
				    }

				    public function store(Request $request)
				    {
				        $contact = request()->user()->contacts()->create($this->validateData());
				        
				        return (new ContactResource($contact))->response()->setStatusCode(201);
				    }

				    public function show(Contact $contact)
				    {
				        if(request()->user()->isNot($contact->user))
				        {
				            return response([], 403);
				        }

				        return new ContactResource($contact);
				    }

				    public function update(Request $request, Contact $contact)
				    {
				        if(request()->user()->isNot($contact->user))
				        {
				            return response([], 403);
				        }

				        $contact->update($this->validateData());

				        return (new ContactResource($contact))->response()->setStatusCode(200); 
				    }

				    public function destroy(Contact $contact)
				    {
				        if(request()->user()->isNot($contact->user))
				        {
				            return response([], 403);
				        }
				        
				        $contact->delete();

				        return response([], 204);
				    }
				}


		#Modify the tests regarding display as resource will return everything inside data array
			#tests->Feature->ContactTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use App\Model\Contact;
				use App\User;
				use Carbon\Carbon;

				class ContactsTest extends TestCase
				{
				    use RefreshDatabase;

				    protected $user;

				    protected function setUp(): void 
				    {
				        parent::setUp();

				        $this->user = factory('App\User')->create();
				    }

				    private function data()
				    {
				        return [
				            'name' => 'User',
				            'email' => 'user@test.com',
				            'birthday' => '05/10/1996',
				            'company' => 'Telecom',
				            'api_token' => $this->user->api_token
				        ];
				    }

				    /** @test */
				    public function contactCreatedCount()
				    {
				        $this->withoutExceptionHandling();

				        $this->post('/api/contacts', $this->data());

				        $this->assertCount(1, Contact::all());
				    }
				                    
				    /** @test */
				    public function contactCreatedEquals()
				    {
				        $this->withoutExceptionHandling();

				        $response = $this->post('/api/contacts', $this->data());

				        $contact = Contact::first();
				        
				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('Telecom', $contact->company);

				        $response->assertStatus(201);

				        $response->assertJson([
				            'data' => [
				                'id' => $contact->id,
				                'name' => $contact->name,
				                'email' => $contact->email,
				                'birthday' => $contact->birthday->format('d.m.Y'),
				                'company' => $contact->company,
				                'last_updated' => $contact->updated_at->diffForHumans(),
				            ],
				            'links' => [
				                'self' => $contact->path()
				            ]
				        ]);
				    }

				    /** @test */
				    public function nameRequiredSessionErrors()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['name' => '']));

				        $contact = Contact::first();
				        
				        $response->assertSessionHasErrors('name');
				        $this->assertCount(0, Contact::all());
				    } 

				    /** @test */
				    public function fieldsRequiredSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), [$field => '']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors($field);
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validEmailSessionErrors()
				    {
				        collect(['name', 'email', 'birthday', 'company'])
				            ->each(function($field){
				                $response = $this->post('/api/contacts', array_merge($this->data(), ['email' => 'not an email format']));

				                $contact = Contact::first();
				                
				                $response->assertSessionHasErrors('email');
				                $this->assertCount(0, Contact::all());
				            });
				    }

				    /** @test */
				    public function validBirthdayInstanceOf()
				    {
				        $this->withoutExceptionHandling();

				        $response = $this->post('/api/contacts', array_merge($this->data()));
				        
				        $this->assertCount(1, Contact::all());
				        $this->assertInstanceOf(Carbon::class, Contact::first()->birthday);
				        $this->assertEquals('05-10-1996', Contact::first()->birthday->format('m-d-Y'));
				    }

				    /** @test */
				    public function singleContactJson()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);
				        
				        $response = $this->get('api/contacts/' . $contact->id. '?api_token=' . $this->user->api_token);
				    
				        $response->assertJson([
				            'data' => [
				                'id' => $contact->id,
				                'name' => $contact->name,
				                'email' => $contact->email,
				                'birthday' => $contact->birthday->format('d.m.Y'),
				                'company' => $contact->company,
				                'last_updated' => $contact->updated_at->diffForHumans(),
				            ]
				        ]);
				    }

				    /** @test */
				    public function singleContactAuthenticatedJson()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);
				        
				        $user2 = factory('App\User')->create();

				        $response = $this->get('api/contacts/' . $contact->id . '?api_token=' . $user2->api_token);
				    
				        $response->assertStatus(403);
				    }

				    /** @test */
				    public function editContactEquals()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $response = $this->put('api/contacts/' . $contact->id . '?api_token=' . $this->user->api_token, $this->data());
				        
				        $contact = $contact->fresh();

				        $this->assertEquals('User', $contact->name);
				        $this->assertEquals('user@test.com', $contact->email);
				        $this->assertEquals('05/10/1996', $contact->birthday->format('m/d/Y'));
				        $this->assertEquals('Telecom', $contact->company);
				    
				        $response->assertStatus(200);

				        $response->assertJson([
				            'data' => [
				                'id' => $contact->id,
				            ],
				            'links' => [
				                'self' => $contact->path()
				            ]
				        ]);
				    }

				    /** @test */
				    public function editContactAuthenticatedEquals()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $user2 = factory('App\User')->create();
				        
				        $response = $this->put('api/contacts/' . $contact->id . '?api_token=' . $user2->api_token, $this->data());
				        
				        $response->assertStatus(403);
				    }

				    /** @test */ #Differeny way to add API token
				    public function deleteContactCount()
				    {
				        $contact = factory('App\Model\Contact')->create(['user_id' => $this->user->id]);

				        $response = $this->delete('api/contacts/' . $contact->id, ['api_token' => $this->user->api_token]);
				    
				        $this->assertCount(0, Contact::all());

				        $response->assertStatus(204);
				    }

				    /** @test */ #Differeny way to add API token
				    public function deleteContactAuthenticatedCount()
				    { 
				        $contact = factory('App\Model\Contact')->create();

				        $response = $this->delete('api/contacts/' . $contact->id, ['api_token' => $this->user->api_token]);
				    
				        $response->assertStatus(403);
				    }

				    /** @test */ #Differeny way to add API token
				    public function redirectUnauthenticated()
				    {
				        $response = $this->post('/api/contacts', array_merge($this->data(), ['api_token' => '']));
				    
				        $response->assertRedirect('/login');

				        $this->assertCount(0, Contact::all());
				    }

				    /** @test */
				    public function allContactsOfAuthUser()
				    {
				        $this->withoutExceptionHandling();

				        $user1 = factory('App\User')->create();
				        $user2 = factory('App\User')->create();

				        $contact1 = factory('App\Model\Contact')->create(['user_id' => $user1->id]);
				        $contact2 = factory('App\Model\Contact')->create(['user_id' => $user2->id]);

				        $response = $this->get('/api/contacts?api_token=' . $user1->api_token);
				    
				        $response->assertJsonCount(1)->assertJson([
				            'data' => [
				                [
				                    'data' => [
				                        'id' => $contact1->id
				                    ]
				                ]
				            ] 
				        ]);
				    }
				}

7) Implement search using Laravel Scout
	[7.1] Basic setup and installation
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

	[7.2] Modify Model and make Controller for search
		#Add use Seachable in the Model
			app->Model->Contact
				<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;
				use Carbon\Carbon;
				use App\User;
				use Laravel\Scout\Searchable;

				class Contact extends Model
				{
				    use Searchable;

				    protected $guarded = [];
				    protected $dates = ['birthday'];

				    public function setBirthdayAttribute($birthday)
				    {
				        $this->attributes['birthday'] = Carbon::parse($birthday);
				    }

				    public function user()
				    {
				        return $this->belongsTo(User::class);
				    }

				    public function path()
				    {
				        return '/contacts/' . $this->id;
				    }

				    public function scopeBirthdays($query)
				    {
				        return $query->whereRaw('birthday like "%-' . now()->format('m') . '-%"');
				    }
				}

		#Import scout in the database and make Controller and Route
			php artisan scout:import \\App\\Model\\Contact

			php artisan make:controller SearchController

			#Add index function in the controller
				#app->Http->Controllers->SearchController
					<?php

					namespace App\Http\Controllers;

					use Illuminate\Http\Request;
					use App\Http\Resources\ContactResource;
					use App\Model\Contact;

					class SearchController extends Controller
					{
					    public function index()
					    {
					        $data = request()->validate([
					            'searchTerm' => 'required'
					        ]);

        					$searchResult = Contact::search($data['searchTerm'])->where('user_id', request()->user()->id)->get();
					    
					        return ContactResource::collection($searchResult);
					    }
					}

			#Add search route in the api
				#routes->api.php
					<?php

					use Illuminate\Http\Request;
					use Illuminate\Support\Facades\Route;

					Route::middleware('auth:api')->group(function () {
					    
					    Route::get('/contacts', 'ContactController@index');
					    Route::get('/contacts/{contact}', 'ContactController@show');
					    Route::post('/contacts', 'ContactController@store');
					    Route::put('/contacts/{contact}', 'ContactController@update');
					    Route::delete('/contacts/{contact}', 'ContactController@destroy');

					    Route::get('/birthdays', 'BirthdayController@index');

					    Route::post('/search', 'SearchController@index');

					});



8) Frontend for Auth,CRUD and UI Design
	[8.1] Setup TailwindCSS
		#Copy commands from TailwindCSS website
			npm install tailwindcss

		#Import the Tailwind classes
			#resources->sass->app.scss
				// Fonts
				@import url('https://fonts.googleapis.com/css?family=Nunito');

				// Variables
				@import 'variables';

				// Bootstrap
				@import '~bootstrap/scss/bootstrap';

				//TailwindCSS
				@tailwind base;

				@tailwind components;

				@tailwind utilities;

		#Create your own config file and edit
			npx tailwindcss init

			#tailwind.config.js
				module.exports = {
				    theme: {
				        extend: {
				            width: {
				              '96': '24rem'
				            }
				        },
				    },
				    variants: {},
				    plugins: [],
				}

		#Import it in projetc using the Laravel Mix section from the documentation
			#webpack.mix.js 
				const mix = require('laravel-mix');

				const tailwindcss = require('tailwindcss')

				mix.js('resources/js/app.js', 'public/js')
				    .sass('resources/sass/app.scss', 'public/css')
				        .options({
				            processCssUrls: false,
				            postCss: [
				              tailwindcss('./tailwind.config.js'),
				            ]
				        })

	[8.2] Design the Login, Registration and Forget your password page
		#Use the sam design in all the 3 files
			#resources->views->auth->login.blade.php
				@extends('layouts.app')

				@section('content')
				    <div class="mx-auto h-full flex justify-center items-center bg-gray-200">
				        <div class="w-96 bg-blue-900 rounded-lg shadow-xl p-6">
				        
				        <svg class="fill-current h-16 w-16 text-gray-100" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				            viewBox="0 0 465 465" style="enable-background:new 0 0 465 465;" xml:space="preserve">
				            <path d="M457.5,15H7.5C3.357,15,0,18.358,0,22.5v420c0,4.142,3.357,7.5,7.5,7.5h450c4.143,0,7.5-3.358,7.5-7.5v-420
				                C465,18.358,461.643,15,457.5,15z M450,65h-35V30h35V65z M400,30v35H15V30H400z M15,435V80h435v355H15z"/>
				            <path d="M397.5,220h-330c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5,7.5,7.5h330c4.143,0,7.5-3.358,7.5-7.5S401.643,220,397.5,220z"/>
				            <path d="M212.5,260h-145c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5,7.5,7.5h145c4.143,0,7.5-3.358,7.5-7.5S216.643,260,212.5,260z"/>
				            <path d="M212.5,300h-145c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5,7.5,7.5h145c4.143,0,7.5-3.358,7.5-7.5S216.643,300,212.5,300z"/>
				            <path d="M212.5,340h-145c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5,7.5,7.5h145c4.143,0,7.5-3.358,7.5-7.5S216.643,340,212.5,340z"/>
				            <path d="M397.5,260h-145c-4.143,0-7.5,3.358-7.5,7.5v30c0,4.142,3.357,7.5,7.5,7.5s7.5-3.358,7.5-7.5V275h130v105H260v-52.5
				                c0-4.142-3.357-7.5-7.5-7.5s-7.5,3.358-7.5,7.5v60c0,4.142,3.357,7.5,7.5,7.5h145c4.143,0,7.5-3.358,7.5-7.5v-120
				                C405,263.358,401.643,260,397.5,260z"/>
				            <path d="M212.5,380h-145c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5,7.5,7.5h145c4.143,0,7.5-3.358,7.5-7.5S216.643,380,212.5,380z"/>
				            <path d="M336.641,160.31c5.052,2.658,11.048,3.639,16.848,4.587c13.05,2.134,14.905,3.538,14.905,7.598
				                c0,5.925-8.605,7.506-13.69,7.506c-6.801,0-12.175-2.222-13.371-5.53c-1.41-3.896-5.715-5.91-9.604-4.5
				                c-3.896,1.409-5.91,5.709-4.501,9.604C330.67,189.089,341.198,195,354.703,195c16.893,0,28.69-9.255,28.69-22.506
				                c0-7.992-3.676-14.151-10.631-17.812c-5.053-2.659-11.052-3.641-16.853-4.589c-13.043-2.133-14.897-3.534-14.897-7.587
				                c0-5.925,8.605-7.506,13.69-7.506c6.8,0,12.173,2.222,13.372,5.528c1.411,3.893,5.709,5.91,9.606,4.495
				                c3.895-1.412,5.907-5.713,4.495-9.607C378.729,125.907,368.202,120,354.703,120c-16.893,0-28.69,9.255-28.69,22.506
				                C326.013,150.495,329.688,156.651,336.641,160.31z"/>
				            <path d="M250.633,189.342c0.769,3.031,3.336,5.268,6.444,5.612c3.097,0.35,6.104-1.274,7.517-4.064l8.513-16.799l8.513,16.799
				                c1.288,2.54,3.887,4.11,6.688,4.11c0.275,0,0.552-0.015,0.829-0.046c3.108-0.344,5.676-2.581,6.444-5.612l15.203-60
				                c1.018-4.015-1.413-8.095-5.429-9.112c-4.014-1.017-8.094,1.412-9.112,5.428l-10.288,40.603l-6.157-12.151
				                c-1.278-2.521-3.864-4.11-6.69-4.11s-5.412,1.589-6.69,4.11l-6.157,12.151l-10.288-40.603c-1.018-4.016-5.099-6.442-9.112-5.428
				                c-4.016,1.017-6.446,5.097-5.429,9.112L250.633,189.342z"/>
				            <path d="M170.319,195H212.7c4.143,0,7.5-3.358,7.5-7.5s-3.357-7.5-7.5-7.5h-34.881v-15h20.754c4.143,0,7.5-3.358,7.5-7.5
				                s-3.357-7.5-7.5-7.5h-20.754v-15H212.7c4.143,0,7.5-3.358,7.5-7.5s-3.357-7.5-7.5-7.5h-42.381c-4.143,0-7.5,3.358-7.5,7.5v60
				                C162.819,191.642,166.177,195,170.319,195z"/>
				            <path d="M89.106,195c4.143,0,7.5-3.358,7.5-7.5v-39.661l38.009,44.53c1.453,1.703,3.553,2.631,5.706,2.631
				                c0.868,0,1.746-0.151,2.593-0.464c2.947-1.086,4.905-3.895,4.905-7.037v-60c0-4.142-3.357-7.5-7.5-7.5s-7.5,3.358-7.5,7.5v39.661
				                l-38.009-44.53c-2.039-2.389-5.353-3.255-8.299-2.167c-2.947,1.086-4.905,3.895-4.905,7.037v60
				                C81.606,191.642,84.964,195,89.106,195z"/>
				        </svg>

				        <h1 class="text-3xl pt-6 text-gray-100">Welcome Back</h1>
				        <h2 class="text-base text-blue-200">Enter youtr details below!</h2>

				        <form class="mt-8" method="POST" action="{{ route('login') }}">
				            @csrf

				            <div class="reletive">
				                <label for="email" class="uppercase text-blue-400 text-xs font-bold absolute p-1">E-mail</label>

				                <div class="col-md-6">
				                    <input id="email" type="email" class="pt-8 w-full rounded bg-blue-800 p-1 text-gray-100 outline-none focus:bg-blue-700" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus>
				                    @error('email')
				                        <span class="text-red-700 pt-1 text-sm" role="alert">
				                            <strong>{{ $message }}</strong>
				                        </span>
				                    @enderror
				                </div>
				            </div>

				            <div class="pt-3">
				                <label for="password" class="uppercase text-blue-400 text-xs font-bold absolute p-1">Password</label>

				                <div class="">
				                    <input id="password" type="password" class="pt-8 w-full rounded bg-blue-800 p-1 text-gray-100 outline-none focus:bg-blue-700" name="password" name="password" required autocomplete="current-password">
				                    @error('password')
				                        <span class="text-red-700 pt-1 text-sm" role="alert">
				                            <strong>{{ $message }}</strong>
				                        </span>
				                    @enderror
				                </div>
				            </div>

				            <div class="form-check mt-2">
				                <input class="form-check-input" type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}>

				                <label class="text-gray-100" for="remember">
				                    Remember Me?
				                </label>
				            </div>
				                

				            <div class="">
				                <button type="submit" class="mt-8 uppercase rounded-lg bg-gray-100 text-blue-800 font-bold w-full h-8 px-2 text-left">
				                    {{ __('Login') }}
				                </button>
				            </div>

				            <div class="flex justify-between mt-8 text-gray-100">
				                <a class="btn btn-link" href="{{ route('password.request') }}">
				                        Forget Your Password?
				                </a>

				                <a class="btn btn-link" href="{{ route('register') }}">
				                    Register
				                </a>
				            </div>
				        </form>
				            
				        </div>
				    </div>
				@endsection

	[8.3] Modify the controllers properly
		#Add 'api_token' in the RegisterController
			#app->Http->Controllers->Auth->RegisterController
				<?php

				namespace App\Http\Controllers\Auth;

				use App\Http\Controllers\Controller;
				use App\Providers\RouteServiceProvider;
				use App\User;
				use Illuminate\Foundation\Auth\RegistersUsers;
				use Illuminate\Support\Facades\Hash;
				use Illuminate\Support\Facades\Validator;
				use Illuminate\Support\Str;


				class RegisterController extends Controller
				{
				    use RegistersUsers;

				    protected $redirectTo = '/';

				    public function __construct()
				    {
				        $this->middleware('guest');
				    }

				    protected function validator(array $data)
				    {
				        return Validator::make($data, [
				            'name' => ['required', 'string', 'max:255'],
				            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
				            'password' => ['required', 'string', 'min:8', 'confirmed'],
				        ]);
				    }

				    protected function create(array $data)
				    {
				        return User::create([
				            'name' => $data['name'],
				            'email' => $data['email'],
				            'password' => Hash::make($data['password']),
				            'api_token' => Str::random(30),
				        ]);
				    }
				}

		#Redirect all the controllers to '/' rater than '/home'
			protected $redirectTo = '/';

		#Add 'api_token' in the fiillable of the User Model
			#app->User
				<?php

				namespace App;

				use Illuminate\Contracts\Auth\MustVerifyEmail;
				use Illuminate\Foundation\Auth\User as Authenticatable;
				use Illuminate\Notifications\Notifiable;
				use App\Model\Contact;

				class User extends Authenticatable
				{
				    use Notifiable;

				    protected $fillable = [
				        'name', 'email', 'password', 'api_token',
				    ];

				    protected $hidden = [
				        'password', 'remember_token',
				    ];

				    protected $casts = [
				        'email_verified_at' => 'datetime',
				    ];

				    public function contacts()
				    {
				        return $this->hasMany(Contact::class);
				    }
				}

		#Make a mannual logout route
			#routes->web.php
				<?php

				use Illuminate\Support\Facades\Route;

				Auth::routes();

				Route::get('/logout', function() {
				    request()->session()->invalidate();
				});

				Route::get('/{any}', 'HomeController@index')->where('any', '.*');

		#Uncomment middleware auth from the HomeController
			#app->Http->Controllers->HomeController

	[8.4] Make birthday test and controllers
		#Modify api routes for birthday
			<?php

			use Illuminate\Http\Request;
			use Illuminate\Support\Facades\Route;

			Route::middleware('auth:api')->group(function () {
			    
			    Route::get('/contacts', 'ContactController@index');
			    Route::get('/contacts/{contact}', 'ContactController@show');
			    Route::post('/contacts', 'ContactController@store');
			    Route::put('/contacts/{contact}', 'ContactController@update');
			    Route::delete('/contacts/{contact}', 'ContactController@destroy');

			    Route::get('/birthdays', 'BirthdayController@index');
			});

		#Make BirthdayController to get the birthdays of current month
			php artisan make:controller BirthdayController

			#app->Http->Controllers->BirthdayController
				<?php

				namespace App\Http\Controllers;

				use Illuminate\Http\Request;
				use App\User;
				use App\Http\Resources\ContactResource;

				class BirthdayController extends Controller
				{
				    public function index()
				    {
				        $contacts = request()->user()->contacts()->birthdays()->get();
				        return ContactResource::collection($contacts);
				    }
				}

		#Add new function in the Contact Model to make contacts()->birthdays()
			app->Model->Contact
				<?php

				namespace App\Model;

				use Illuminate\Database\Eloquent\Model;
				use Carbon\Carbon;
				use App\User;

				class Contact extends Model
				{
				    protected $guarded = [];

				    protected $dates = ['birthday'];

				    public function setBirthdayAttribute($birthday)
				    {
				        $this->attributes['birthday'] = Carbon::parse($birthday);
				    }

				    public function user()
				    {
				        return $this->belongsTo(User::class);
				    }

				    public function path()
				    {
				        return '/contacts/' . $this->id;
				    }

				    public function scopeBirthdays($query)
				    {
				        return $query->whereRaw('birthday like "%-' . now()->format('m') . '-%"');
				    }
				}


		#Perform test to check the birthdays that occur in current month
			php artisan make:test BirthdayTest

			#tests->Feature->BirthdayTest
				<?php

				namespace Tests\Feature;

				use Illuminate\Foundation\Testing\RefreshDatabase;
				use Illuminate\Foundation\Testing\WithFaker;
				use Tests\TestCase;

				use App\Model\Contact;
				use App\User;
				use Carbon\Carbon;

				class BirthdayTest extends TestCase
				{
				    use RefreshDatabase;

				    /** @test */
				    public function birthdaysCurrentMonth()
				    {
				        $this->withoutExceptionHandling();

				        $user = factory('App\User')->create();

				        $contact1 = factory('App\Model\Contact')->create([
				            'user_id' => $user->id, 
				            'birthday' => now()->subYear()
				        ]);

				        $contact2 = factory('App\Model\Contact')->create([
				            'user_id' => $user->id, 
				            'birthday' => now()->subMonth()
				        ]);

				        $this->get('/api/birthdays?api_token=' . $user->api_token)
				            ->assertJsonCount(1)->assertJson([
				            'data' => [
				                [
				                    'data' => [
				                        'id' => $contact1->id
				                    ]
				                ]
				            ] 
				        ]);
				    }
				}

	[8.5] Make the proper routes and remove default nav bar
		#Assign the route
			#resources->js->router->router.js
				import Vue from 'vue';
				import VueRouter from 'vue-router';

				import ExampleComponent from '../components/ExampleComponent'
				import CreateContact from '../components/views/CreateContact'
				import DisplayContact from '../components/views/DisplayContact'
				import EditContact from '../components/views/EditContact'
				import Contacts from '../components/views/Contacts'
				import Birthdays from '../components/views/Birthdays'
				import Logout from '../components/views/Logout'


				Vue.use(VueRouter);

				export default new VueRouter({
				    routes: [
				        { path: '/', component: ExampleComponent},
				        { path: '/contacts', component: Contacts},
				        { path: '/birthdays', component: Birthdays},
				        { path: '/create', component: CreateContact},
				        { path: '/contacts/:id', component: DisplayContact},
				        { path: '/contacts/:id/edit', component: EditContact},
				        { path: '/logout', component: Logout},
				    ],
				    mode: 'history',
				    hash: false
				});

		#Remove nav component once all the routes are working
			#resources->views->layouts->app.blade.php
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

				    <!-- Fonts -->
				    <link rel="dns-prefetch" href="//fonts.gstatic.com">
				    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

				    <!-- Styles -->
				    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
				</head>
				<body>
				    <div id="app">
				       
				        <main class="h-screen">
				            @yield('content')
				        </main>
				    </div>
				</body>
				</html>

	[8.6] App Dashboard Design
		#Pass the loggedin user to the main App component
			#resources->views->home.blade.php
				@extends('layouts.app')

				@section('content')
				    <App :user="{{auth()->user()}}"/>
				@endsection

		#Make components and create the basic design for the Dashboard
			#resources->js->components->App.vue
				<template>
				    <div class="h-screen bg-white">
				        <div class="flex">
				            <Toolbar/>

				            <div class="flex flex-col flex-1 h-screen">
				                <SearchBar :name="user.name"/>

				                <div class="flex overflow-y-hidden">
				                    <router-view class="p-6 overflow-x-hidden"></router-view>
				                </div>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import Toolbar from './Toolbar'
				    import SearchBar from './SearchBar'

				    export default {
				        name: "App",

				        props: [
				            'user'
				        ],

				        created() {
				            window.axios.interceptors.request.use(
				                (config) => {
				                    if(config.method === 'get') {
				                        config.url = config.url + '?api_token=' + this.user.api_token;
				                    }
				                    else {
				                        config.data = {
				                            ...config.data,
				                            api_token: this.user.api_token  
				                        };
				                    }
				                    
				                    return config;
				                }
				            )
				        },

				        components: {Toolbar, SearchBar}
				    }
				</script>

			#resources->js->components->Toolbar.vue
				<template>
				    <div class="flex flex-col bg-gray-200 w-48 h-screen border-r-2 border-gray-400">
				        <nav class="p-2">
				            <router-link to='/'>
				                <svg class="fill-current h-12 w-12 text-blue-600 m-2" height="472pt" viewBox="0 -17 472 472" width="472pt" xmlns="http://www.w3.org/2000/svg">
				                    <path d="m335.722656 169.875c10.300782 0 10.3125-16 0-16-10.292968 0-10.3125 16 0 16zm0 0"/><path d="m303.328125 78.699219c10.300781 0 10.3125-16 0-16-10.292969 0-10.3125 16 0 16zm0 0"/><path d="m420 0h-368c-28.707031.03125-51.96875 23.292969-52 52v248.277344c.03125 28.703125 23.292969 51.964844 52 52h18.71875c4.738281-.066406 8.863281 3.230468 9.847656 7.867187 10.125 57.308594 47.636719 73.878907 54.746094 76.53125.957031.578125 2.054688.882813 3.171875.882813.308594 0 .617187-.023438.921875-.070313 1.546875-.226562 4.316406-1.230469 5.484375-5.398437.871094-3.117188 1.28125-7.519532 1.796875-13.085938 3.019531-32.285156 9.894531-66.730468 53.566406-66.730468h219.746094c28.707031-.03125 51.96875-23.296876 52-52v-248.273438c-.03125-28.707031-23.292969-51.96875-52-52zm40 300.277344c-.023438 22.078125-17.917969 39.972656-40 40h-219.742188c-25.191406 0-43.355468 10.066406-53.984374 29.929687-8.566407 16-10.347657 35.066407-11.527344 47.683594-.171875 1.835937-.335938 3.574219-.5 5.140625-11.035156-5.839844-34.425782-22.898438-41.859375-64.976562-1.945313-10.402344-11.085938-17.902344-21.667969-17.777344h-18.71875c-22.082031-.027344-39.976562-17.921875-40-40v-248.277344c.023438-22.082031 17.917969-39.976562 40-40h368c22.082031.023438 39.976562 17.917969 40 40zm0 0"/><path d="m180.023438 193.796875c26.671874-8.539063 46.039062-39.65625 46.039062-75.671875 0-43-27.300781-77.988281-60.847656-77.988281-33.550782 0-60.851563 34.984375-60.851563 77.988281v.300781c-1.054687-.089843-2.109375-.144531-3.171875-.144531-25.988281 0-47.132812 26.914062-47.132812 59.992188 0 27.015624 14.269531 50.460937 34.140625 57.691406l-2.109375 6.464844c-.597656 1.828124-.28125 3.828124.847656 5.386718 1.125 1.554688 2.929688 2.476563 4.851562 2.476563h3.402344v61.121093c0 3.316407 2.683594 6 6 6 3.3125 0 6-2.683593 6-6v-61.121093h3.398438c1.921875-.003907 3.726562-.921875 4.855468-2.480469 1.128907-1.554688 1.441407-3.558594.84375-5.382812l-2.089843-6.453126c16.285156-5.867187 28.816406-22.441406 32.800781-43.425781 1.121094.453125 2.257812.878907 3.40625 1.246094l-3.425781 10.492187c-.59375 1.824219-.28125 3.828126.847656 5.382813s2.933594 2.476563 4.855469 2.476563h6.53125v99.265624c0 3.316407 2.6875 6 6 6s6-2.683593 6-6v-99.261718h6.53125c1.921875-.003906 3.726562-.925782 4.855468-2.480469 1.128907-1.554687 1.441407-3.554687.847657-5.382813zm-79.953126 44.5 1.128907-3.457031 1.128906 3.457031zm5.449219-12.390625c-1.71875.292969-3.226562 1.320312-4.128906 2.8125-.066406.113281-.132813.226562-.191406.34375-.0625-.117188-.125-.230469-.191407-.34375-.90625-1.492188-2.414062-2.519531-4.132812-2.8125-17.566406-2.980469-30.8125-23.457031-30.8125-47.628906 0-26.464844 15.761719-47.992188 35.136719-47.992188 1.324219 0 2.648437.105469 3.957031.308594 3.019531 23.84375 14.550781 44.375 30.660156 55.824219-2.605468 20.488281-15.054687 36.898437-30.296875 39.484375zm65.792969-42.300781c-1.722656.292969-3.230469 1.320312-4.132812 2.8125-.902344 1.496093-1.109376 3.308593-.570313 4.964843l2.867187 8.773438h-8.527343l2.863281-8.773438c.542969-1.65625.335938-3.46875-.566406-4.964843-.90625-1.492188-2.414063-2.519531-4.132813-2.8125-24.371093-4.136719-42.75-32.285157-42.75-65.476563 0-36.386718 21.914063-65.988281 48.847657-65.988281 26.9375 0 48.851562 29.597656 48.851562 65.988281 0 33.1875-18.378906 61.335938-42.75 65.472656zm0 0"/><path d="m194.722656 133.019531c-.210937 3.308594 2.296875 6.160157 5.601563 6.371094.128906.011719.257812.015625.390625.015625 3.160156-.003906 5.777344-2.460938 5.980468-5.617188 2.980469-46.476562-22.71875-67.386718-31.953124-71.050781-3.082032-1.21875-6.566407.289063-7.789063 3.367188-1.222656 3.082031.285156 6.570312 3.367187 7.789062 8.617188 3.414063 26.714844 23.042969 24.402344 59.125zm0 0"/><path d="m262.722656 229.417969c0 1.855469 2.261719 2.785156 4.523438 2.785156 2.265625 0 4.527344-.929687 4.527344-2.785156v-36.886719c0-1.914062-2.261719-2.726562-4.527344-2.726562-2.261719 0-4.523438.8125-4.523438 2.726562v14.210938h-11.539062v-14.210938c0-1.914062-2.261719-2.726562-4.527344-2.726562-2.261719 0-4.523438.8125-4.523438 2.726562v36.886719c0 1.855469 2.261719 2.785156 4.523438 2.785156 2.265625 0 4.527344-.929687 4.527344-2.785156v-15.71875h11.539062zm0 0"/><path d="m280.9375 232.203125c1.449219 0 2.609375-.464844 2.957031-1.683594l1.972657-7.25h12.234374l1.96875 7.25c.347657 1.21875 1.507813 1.683594 2.957032 1.683594 2.496094 0 5.800781-1.566406 5.800781-3.714844-.015625-.214843-.054687-.429687-.113281-.636719l-10.84375-35.375c-.636719-2.03125-3.246094-3.015624-5.914063-3.015624s-5.277343.984374-5.917969 3.015624l-10.785156 35.378907c-.0625.207031-.101562.421875-.117187.636719 0 2.144531 3.304687 3.710937 5.800781 3.710937zm11.019531-31.4375 4.230469 15.542969h-8.464844zm0 0"/><path d="m321.246094 229.417969v-12.527344h5.742187c8 0 14.265625-3.710937 14.265625-13.457031v-.289063c0-9.742187-6.03125-13.339843-13.6875-13.339843h-12.003906c-2.03125 0-3.367188 1.277343-3.367188 2.726562v36.886719c0 1.855469 2.265626 2.785156 4.527344 2.785156 2.261719 0 4.523438-.925781 4.523438-2.785156zm0-31.726563h5.742187c3.246094 0 5.21875 1.855469 5.21875 5.800782v.636718c0 3.945313-1.972656 5.800782-5.21875 5.800782h-5.742187zm0 0"/><path d="m354.246094 229.417969v-12.527344h5.742187c8 0 14.269531-3.710937 14.269531-13.457031v-.289063c0-9.742187-6.035156-13.339843-13.691406-13.339843h-12.003906c-2.03125 0-3.363281 1.277343-3.363281 2.726562v36.886719c0 1.855469 2.261719 2.785156 4.523437 2.785156 2.261719 0 4.523438-.925781 4.523438-2.785156zm0-31.726563h5.742187c3.246094 0 5.21875 1.855469 5.21875 5.800782v.636718c0 3.945313-1.972656 5.800782-5.21875 5.800782h-5.742187zm0 0"/><path d="m387.132812 214.046875c.152344.242187.234376.527344.230469.8125v14.558594c0 1.855469 2.261719 2.785156 4.523438 2.785156s4.523437-.929687 4.523437-2.785156v-14.558594c0-.285156.082032-.570313.234375-.8125l11.949219-19.890625c.085938-.203125.128906-.421875.113281-.640625 0-2.144531-3.652343-3.710937-6.148437-3.710937-1.148438-.089844-2.214844.597656-2.609375 1.683593l-8.0625 14.902344-8.117188-14.898437c-.40625-1.074219-1.464843-1.757813-2.613281-1.683594-2.492188 0-6.144531 1.566406-6.144531 3.714844-.015625.21875.023437.4375.113281.636718zm0 0"/><path d="m225.601562 278.835938c3.070313-1.335938 4.925782-4.410157 4.925782-9.105469 0-8.238281-5.796875-10.324219-11.597656-10.324219h-11.890626c-1.972656 0-3.945312.925781-3.945312 2.78125v36.886719c0 1.453125 1.507812 2.726562 3.945312 2.726562h12.875c6.554688 0 11.660157-3.304687 11.660157-12.46875v-1.21875c.003906-5.796875-2.433594-7.945312-5.972657-9.277343zm-13.511718-11.542969h6.089844c2.199218 0 3.304687 2.03125 3.304687 4.058593 0 1.972657-1.097656 4-3.304687 4h-6.089844zm10.441406 21.28125c0 3.714843-1.742188 5.335937-4.640625 5.335937h-5.800781v-11.597656h5.800781c2.898437 0 4.640625 1.390625 4.640625 5.335938zm0 0"/><path d="m240.800781 259.40625c-2.261719 0-4.523437.8125-4.523437 2.726562v36.886719c0 1.855469 2.261718 2.78125 4.523437 2.78125s4.523438-.925781 4.523438-2.78125v-36.886719c0-1.914062-2.261719-2.726562-4.523438-2.726562zm0 0"/><path d="m273.625 283.589844c4.0625-1.566406 7.019531-5.277344 7.019531-11.773438 0-9.453125-6.320312-12.410156-14.265625-12.410156h-12.007812c-.734375-.023438-1.449219.253906-1.972656.769531-.527344.511719-.820313 1.21875-.8125 1.957031v36.886719c0 1.855469 2.261718 2.78125 4.523437 2.78125s4.527344-.925781 4.527344-2.78125v-13.980469h3.828125l7.945312 15.429688c.550782 1.082031 1.6875 1.738281 2.898438 1.679688 2.667968 0 5.683594-2.433594 5.683594-4.699219.007812-.367188-.09375-.730469-.289063-1.042969zm-7.246094-5.507813h-5.742187v-10.789062h5.742187c3.246094 0 5.21875 1.335937 5.21875 5.394531s-1.972656 5.394531-5.21875 5.394531zm0 0"/><path d="m310.109375 259.40625h-25.054687c-1.914063 0-2.726563 2.085938-2.726563 4 0 2.199219.984375 4.117188 2.726563 4.117188h8v31.492187c0 1.855469 2.261718 2.785156 4.523437 2.785156s4.523437-.929687 4.523437-2.785156v-31.492187h8c1.738282 0 2.722657-1.914063 2.722657-4.117188.011719-1.914062-.800781-4-2.714844-4zm0 0"/><path d="m341.542969 259.40625c-2.261719 0-4.523438.8125-4.523438 2.726562v14.207032h-11.539062v-14.207032c0-1.914062-2.261719-2.726562-4.527344-2.726562-2.261719 0-4.523437.8125-4.523437 2.726562v36.886719c0 1.855469 2.261718 2.78125 4.523437 2.78125 2.265625 0 4.527344-.925781 4.527344-2.78125v-15.71875h11.539062v15.71875c0 1.855469 2.261719 2.78125 4.523438 2.78125s4.523437-.925781 4.523437-2.78125v-36.886719c0-1.914062-2.261718-2.726562-4.523437-2.726562zm0 0"/><path d="m366.542969 259.40625h-10.265625c-2.378906 0-3.945313 1.273438-3.945313 2.726562v36.941407c0 1.453125 1.566407 2.726562 3.945313 2.726562h10.265625c8 0 14.265625-3.710937 14.265625-13.6875v-15.019531c0-9.976562-6.261719-13.6875-14.265625-13.6875zm5.21875 28.707031c0 3.945313-1.972657 5.800781-5.21875 5.800781h-5.164063v-26.621093h5.164063c3.246093 0 5.21875 1.855469 5.21875 5.800781zm0 0"/><path d="m406.386719 262.074219c-.636719-2.027344-3.246094-3.015625-5.914063-3.015625-2.667968 0-5.277344.988281-5.917968 3.015625l-10.785157 35.378906c-.0625.210937-.101562.421875-.117187.640625 0 2.144531 3.304687 3.710938 5.800781 3.710938 1.449219 0 2.609375-.464844 2.957031-1.683594l1.972656-7.246094h12.238282l1.96875 7.246094c.347656 1.21875 1.511718 1.683594 2.960937 1.683594 2.492188 0 5.796875-1.566407 5.796875-3.710938-.015625-.21875-.054687-.429688-.113281-.640625zm-10.148438 23.839843 4.234375-15.542968 4.234375 15.542968zm0 0"/><path d="m441.59375 259.40625c-1.148438-.09375-2.21875.597656-2.609375 1.683594l-8.0625 14.898437-8.121094-14.898437c-.402343-1.078125-1.464843-1.761719-2.609375-1.683594-2.492187 0-6.148437 1.566406-6.148437 3.710938-.011719.21875.027343.4375.117187.636718l12.003906 19.894532c.15625.242187.234376.523437.234376.8125v14.558593c0 1.855469 2.261718 2.78125 4.523437 2.78125s4.523437-.925781 4.523437-2.78125v-14.558593c0-.289063.078126-.570313.234376-.8125l11.945312-19.894532c.089844-.199218.128906-.417968.117188-.636718 0-2.140626-3.652344-3.710938-6.148438-3.710938zm0 0"/><path d="m244.746094 40.707031c10.296875 0 10.3125-16 0-16-10.292969 0-10.3125 16 0 16zm0 0"/><path d="m255.945312 129.289062c10.292969 0 10.3125-16 0-16-10.296874 0-10.3125 16 0 16zm0 0"/><path d="m121.984375 36.710938c10.292969 0 10.3125-16 0-16-10.296875 0-10.3125 16 0 16zm0 0"/><path d="m79.792969 99.894531c10.300781 0 10.3125-16 0-16-10.292969 0-10.3125 16 0 16zm0 0"/><path d="m36.199219 233.65625c-10.300781 0-10.3125 16 0 16 10.300781 0 10.3125-16 0-16zm0 0"/><path d="m206.957031 204.265625c-10.300781 0-10.3125 16 0 16 10.296875 0 10.3125-16 0-16zm0 0"/><path d="m34.800781 141.886719c10.300781 0 10.3125-16 0-16-10.292969 0-10.3125 16 0 16zm0 0"/><path d="m48.800781 26.511719c-10.296875 0-10.3125 16 0 16 10.292969 0 10.308594-16 0-16zm0 0"/>
				                </svg>
				            </router-link>

				            <p class="text-gray-600 font-bold text-xs uppercase pt-12 m-2">Create</p>

				            <router-link to='/create' class="flex items-center m-2">
				                <svg class="fill-current h-5 w-5 text-blue-600" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
				                    <path d="M492,236H276V20c0-11.046-8.954-20-20-20c-11.046,0-20,8.954-20,20v216H20c-11.046,0-20,8.954-20,20s8.954,20,20,20h216 v216c0,11.046,8.954,20,20,20s20-8.954,20-20V276h216c11.046,0,20-8.954,20-20C512,244.954,503.046,236,492,236z"/>
				                </svg>

				                <p class="text-gray-800 font-bold text-xs ml-2 hover:text-blue-600">Add New</p>
				            </router-link>


				            <p class="text-gray-600 font-bold text-xs uppercase pt-12 m-2">General</p>

				            <router-link to='/contacts' class="flex items-center m-2">
				                <svg class="fill-current h-5 w-5 text-blue-600" height="640pt" viewBox="-20 -99 640 640" width="640pt" xmlns="http://www.w3.org/2000/svg">
				                    <path d="m179.25 211c35.691406 0 64.625-28.9375 64.625-64.625 0-35.691406-28.933594-64.625-64.625-64.625s-64.625 28.933594-64.625 64.625c.046875 35.671875 28.953125 64.578125 64.625 64.625zm0-104.125c21.882812 0 39.625 17.738281 39.625 39.625 0 21.882812-17.742188 39.625-39.625 39.625-21.886719 0-39.625-17.742188-39.625-39.625.007812-21.882812 17.742188-39.617188 39.625-39.625zm0 0"/><path d="m179.25 234.875c-26.441406-.195312-51.820312 10.417969-70.25 29.375-18.75 19.125-29 45.125-29 73.375.019531 6.894531 5.605469 12.480469 12.5 12.5h173.5c6.894531-.019531 12.480469-5.605469 12.5-12.5 0-28.25-10.25-54.25-29-73.375-18.429688-18.957031-43.804688-29.570312-70.25-29.375zm-73.375 90.25c2.140625-16.34375 9.507812-31.554688 21-43.375 13.832031-13.996094 32.695312-21.875 52.375-21.875s38.542969 7.878906 52.375 21.875c11.46875 11.832031 18.835938 27.039062 21 43.375zm0 0"/><path d="m537.5-5.25h-475c-34.511719.015625-62.484375 27.988281-62.5 62.5v317.5c.015625 34.511719 27.988281 62.484375 62.5 62.5h475c34.511719-.015625 62.484375-27.988281 62.5-62.5v-317.5c-.015625-34.511719-27.988281-62.484375-62.5-62.5zm37.5 380c-.058594 20.683594-16.816406 37.441406-37.5 37.5h-475c-20.683594-.058594-37.441406-16.816406-37.5-37.5v-317.5c.058594-20.683594 16.816406-37.441406 37.5-37.5h475c20.683594.058594 37.441406 16.816406 37.5 37.5zm0 0"/><path d="m506.75 203.5h-145.625c-6.902344 0-12.5 5.59375-12.5 12.5s5.597656 12.5 12.5 12.5h145.625c6.902344 0 12.5-5.59375 12.5-12.5s-5.597656-12.5-12.5-12.5zm0 0"/><path d="m506.75 283.5h-145.625c-6.902344 0-12.5 5.59375-12.5 12.5s5.597656 12.5 12.5 12.5h145.625c6.902344 0 12.5-5.59375 12.5-12.5s-5.597656-12.5-12.5-12.5zm0 0"/><path d="m506.75 123.5h-145.625c-6.902344 0-12.5 5.59375-12.5 12.5s5.597656 12.5 12.5 12.5h145.625c6.902344 0 12.5-5.59375 12.5-12.5s-5.597656-12.5-12.5-12.5zm0 0"/>
				                </svg>

				                <p class="text-gray-800 font-bold text-xs ml-2 hover:text-blue-600">Contacts</p>
				            </router-link>

				            <router-link to='/birthdays' class="flex items-center m-2">
				                <svg class="fill-current h-5 w-5 text-blue-600" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 480.187 480.187" style="enable-background:new 0 0 480.187 480.187;" xml:space="preserve">

				                    <path d="M327.417,301.136c-1.498-4.157-6.082-6.312-10.238-4.814c-4.157,1.498-6.312,6.082-4.814,10.238
				                        c0.037,0.102,0.076,0.203,0.117,0.304c7.296,19.04,7.824,33.6,1.44,40c-7.744,7.728-27.032,5.312-51.608-6.448
				                        c-32.902-17.084-62.809-39.402-88.552-66.08c-62.664-62.672-88.52-124.168-72.528-140.16c5.103-4.03,11.736-5.578,18.096-4.224
				                        c4.406,0.324,8.241-2.986,8.565-7.392c0.313-4.259-2.774-8.013-7.013-8.528c-11.123-1.968-22.535,1.275-30.96,8.8
				                        c-29.312,29.304,15.496,105.744,72.528,162.784c27.021,27.962,58.419,51.333,92.96,69.192c6.255,2.995,12.701,5.574,19.296,7.72
				                        l-56.84,21.552c-75.9-28.856-130.539-96.144-143.2-176.352c-0.685-4.365-4.779-7.349-9.144-6.664
				                        c-4.365,0.685-7.349,4.779-6.664,9.144c1.256,8,2.936,16,4.992,23.824c18.422,69.799,66.943,127.784,132.4,158.224l-93.552,35.4
				                        c-0.429-0.716-0.969-1.358-1.6-1.904c-23.776-19.089-38.694-47.084-41.28-77.464l-3.712-44.952
				                        c-0.292-4.355-4.06-7.649-8.416-7.357c-0.083,0.006-0.166,0.012-0.248,0.021c-4.404,0.35-7.691,4.205-7.341,8.609
				                        c0.001,0.018,0.003,0.037,0.005,0.055l3.776,44.936c2.812,32.473,17.96,62.633,42.328,84.28l-66.736,25.264l12-49.248
				                        c1.047-4.295-1.585-8.625-5.88-9.672c-4.295-1.047-8.625,1.585-9.672,5.88l-15.608,64c-1.052,4.291,1.574,8.623,5.866,9.674
				                        c1.574,0.386,3.227,0.284,4.742-0.29l296-112c0.471-0.23,0.916-0.509,1.328-0.832c6.406-0.984,12.345-3.946,16.984-8.472
				                        C333.161,350.256,339.985,333.912,327.417,301.136z"/>

				                    <path d="M402.913,280.504c-43.247-16.19-89.99-20.729-135.544-13.16l-28.584,4.8c-4.339,0.834-7.18,5.027-6.346,9.366
				                        c0.806,4.192,4.761,7.013,8.986,6.41l28.576-4.76c42.782-7.113,86.683-2.847,127.296,12.368c0.901,0.319,1.852,0.479,2.808,0.472
				                        c4.418,0.007,8.006-3.568,8.013-7.987C408.124,284.668,406.048,281.673,402.913,280.504z"/>

				                    <path d="M431.353,156.56c-1.9-3.99-6.674-5.684-10.664-3.784l-168,80c-3.989,1.899-5.684,6.672-3.785,10.662
				                        c0,0.001,0.001,0.002,0.001,0.002c1.899,3.989,6.672,5.684,10.662,3.785c0.001,0,0.001-0.001,0.002-0.001l168-80
				                        C431.559,165.324,433.253,160.55,431.353,156.56z"/>

				                    <path d="M194.377,54.296c-0.88-4.33-5.103-7.127-9.433-6.247c-4.33,0.88-7.127,5.103-6.247,9.433
				                        c0.019,0.096,0.041,0.191,0.064,0.286c10.126,45.239,5.953,92.507-11.944,135.272l-11.632,27.912
				                        c-1.681,4.067,0.238,8.728,4.296,10.432c0.972,0.409,2.017,0.618,3.072,0.616c3.229,0,6.141-1.94,7.384-4.92l11.64-27.88
				                        C200.752,153.391,205.225,102.757,194.377,54.296z"/>

				                    <path d="M440.105,288c-13.255,0-24,10.745-24,24s10.745,24,24,24s24-10.745,24-24S453.36,288,440.105,288z M440.105,320
				                        c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S444.523,320,440.105,320z"/>

				                    <path d="M248.105,64c-13.255,0-24,10.745-24,24s10.745,24,24,24s24-10.745,24-24S261.36,64,248.105,64z M248.105,96
				                        c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S252.523,96,248.105,96z"/>

				                    <circle cx="176.105" cy="16" r="16"/>

				                    <path d="M400.105,40c-4.418,0-8,3.582-8,8v8c0,4.418,3.582,8,8,8s8-3.582,8-8v-8C408.105,43.582,404.523,40,400.105,40z"/>

				                    <path d="M400.105,0c-4.418,0-8,3.582-8,8v8c0,4.418,3.582,8,8,8s8-3.582,8-8V8C408.105,3.582,404.523,0,400.105,0z"/>

				                    <path d="M424.105,24h-8c-4.418,0-8,3.582-8,8s3.582,8,8,8h8c4.418,0,8-3.582,8-8S428.523,24,424.105,24z"/>

				                    <path d="M384.105,24h-8c-4.418,0-8,3.582-8,8s3.582,8,8,8h8c4.418,0,8-3.582,8-8S388.523,24,384.105,24z"/>

				                    <path d="M344.105,87.832h-40.168c-4.418,0-8,3.582-8,8V136c0,4.418,3.582,8,8,8h40.168c4.418,0,8-3.582,8-8V95.832
				                        C352.105,91.414,348.523,87.832,344.105,87.832z M336.105,128h-24.168v-24.168h24.168V128z"/>

				                    <path d="M285.826,154.636c-2.937-3.135-7.825-3.391-11.073-0.58l-80,72c-3.282,2.956-3.547,8.013-0.592,11.296
				                        c2.956,3.282,8.013,3.547,11.296,0.592l80-72C288.682,162.923,288.847,157.861,285.826,154.636z"/>

				                    <path d="M432.105,184c-4.418,0-8,3.582-8,8v8c0,4.418,3.582,8,8,8s8-3.582,8-8v-8C440.105,187.582,436.523,184,432.105,184z"/>

				                    <path d="M466.049,182.624l-5.656-5.656c-3.178-3.07-8.242-2.982-11.312,0.196c-2.994,3.1-2.994,8.015,0,11.116l5.656,5.656
				                        c3.178,3.07,8.242,2.982,11.312-0.196C469.044,190.639,469.044,185.724,466.049,182.624z"/>

				                    <path d="M472.105,152h-8c-4.418,0-8,3.582-8,8s3.582,8,8,8h8c4.418,0,8-3.582,8-8S476.523,152,472.105,152z"/>

				                    <path d="M465.853,126.064c-3.1-2.994-8.015-2.994-11.116,0l-5.656,5.656c-3.124,3.125-3.123,8.19,0.002,11.314
				                        c1.5,1.499,3.534,2.342,5.654,2.342v0c2.122,0,4.156-0.844,5.656-2.344l5.656-5.656
				                        C469.119,134.198,469.031,129.133,465.853,126.064z"/>

				                    <path d="M432.105,112c-4.418,0-8,3.582-8,8v8c0,4.418,3.582,8,8,8s8-3.582,8-8v-8C440.105,115.582,436.523,112,432.105,112z"/>

				                    <path d="M415.129,131.72l-5.656-5.656c-3.178-3.069-8.242-2.982-11.312,0.196c-2.994,3.1-2.994,8.015,0,11.116l5.656,5.656
				                        c3.178,3.07,8.242,2.982,11.312-0.196C418.124,139.735,418.124,134.82,415.129,131.72z"/>

				                    <path d="M95.713,34.592c-0.942-2.894-3.445-5.002-6.456-5.44l-23.48-3.416L55.305,4.464c-2.334-3.963-7.439-5.284-11.402-2.95
				                        c-1.218,0.717-2.233,1.732-2.95,2.95l-10.52,21.272l-23.48,3.416c-4.373,0.631-7.406,4.688-6.775,9.061
				                        c0.251,1.741,1.069,3.35,2.327,4.579l16.984,16.56l-4,23.384c-0.768,4.351,2.136,8.501,6.487,9.269
				                        c1.752,0.309,3.556,0.026,5.129-0.805l21-11.072l21,11.04c3.911,2.056,8.748,0.553,10.804-3.358
				                        c0.819-1.557,1.101-3.34,0.804-5.074l-4-23.384l16.992-16.56C95.88,40.663,96.658,37.485,95.713,34.592z M62.505,50.832
				                        c-1.884,1.835-2.745,4.479-2.304,7.072l1.984,11.56L51.825,64c-2.329-1.223-5.111-1.223-7.44,0l-10.4,5.456l1.984-11.56
				                        c0.449-2.583-0.397-5.223-2.264-7.064l-8.408-8.184l11.608-1.688c2.606-0.378,4.859-2.015,6.024-4.376l5.176-10.504l5.184,10.504
				                        c1.164,2.359,3.413,3.995,6.016,4.376l11.6,1.688L62.505,50.832z"/>

				                    <path d="M453.081,401h-0.032l-3.296-4.944c-18.481-27.637-47.542-46.429-80.328-51.944c-4.374-0.624-8.426,2.416-9.05,6.79
				                        c-0.603,4.226,2.218,8.181,6.41,8.986c23.648,4.014,45.199,16.028,61.048,34.032c-13.325,2.397-24.979,10.4-32,21.976
				                        c-8.616,15.431-3.091,34.924,12.34,43.54c15.431,8.616,34.924,3.091,43.54-12.34c3.291-6.353,5.068-13.382,5.192-20.536
				                        c8.512,12.363,9.193,28.508,1.752,41.544c-2.254,3.8-1.001,8.708,2.799,10.962c3.8,2.254,8.708,1.001,10.962-2.799
				                        c0.072-0.122,0.141-0.245,0.207-0.371C487.273,449.732,478.645,416.671,453.081,401z M437.761,439.288
				                        c-4.27,7.737-14.003,10.547-21.739,6.277s-10.547-14.003-6.277-21.739c0.024-0.043,0.048-0.087,0.072-0.13
				                        c4.721-7.73,12.684-12.912,21.664-14.096c1.391-0.038,2.768,0.282,4,0.928C442.233,414.296,442.593,430.632,437.761,439.288z"/>

				                </svg>

				                <p class="text-gray-800 font-bold text-xs ml-2 hover:text-blue-600">Birthday</p>
				            </router-link>

				            <p class="text-gray-600 font-bold text-xs uppercase pt-12 m-2">Settings</p>

				            <router-link to='/logout' class="flex items-center m-2">
				                <svg class="fill-current h-5 w-5 text-blue-600" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">

				                        <path d="M255.15,468.625H63.787c-11.737,0-21.262-9.526-21.262-21.262V64.638c0-11.737,9.526-21.262,21.262-21.262H255.15
				                            c11.758,0,21.262-9.504,21.262-21.262S266.908,0.85,255.15,0.85H63.787C28.619,0.85,0,29.47,0,64.638v382.724
				                            c0,35.168,28.619,63.787,63.787,63.787H255.15c11.758,0,21.262-9.504,21.262-21.262
				                            C276.412,478.129,266.908,468.625,255.15,468.625z"/>

				                        <path d="M505.664,240.861L376.388,113.286c-8.335-8.25-21.815-8.143-30.065,0.213s-8.165,21.815,0.213,30.065l92.385,91.173
				                            H191.362c-11.758,0-21.262,9.504-21.262,21.262c0,11.758,9.504,21.263,21.262,21.263h247.559l-92.385,91.173
				                            c-8.377,8.25-8.441,21.709-0.213,30.065c4.167,4.21,9.653,6.336,15.139,6.336c5.401,0,10.801-2.041,14.926-6.124l129.276-127.575
				                            c4.04-3.997,6.336-9.441,6.336-15.139C512,250.302,509.725,244.88,505.664,240.861z"/>
				                </svg>

				                <p class="text-gray-800 font-bold text-xs ml-2 hover:text-blue-600">Logout</p>
				            </router-link>
				        </nav>
				    </div>
				</template>

				<script>
				    export default {
				        name: "Toolbar"
				    }
				</script>

				<style>

				</style>

			#resources->js->components->SearchBar.vue
				<template>
				    <div class="h-16 px-3 border-b-2 border-gray-400 flex items-center justify-between">

				        <div class="">
				            contacts
				        </div>

				        <UserCircle :name="name"/>
				    </div>
				</template>

				<script>
				    import UserCircle from './views/UserCircle'

				    export default {
				        name: "SearchBar",

				        components: {UserCircle},

				        props: [
				            'name'
				        ],
				    }
				</script>

				<style>

				</style>

		#Create a new folder views for the UserCircle Component
			#resources->js->components->views->UserCircle.vue
				<template>
				    <div class="rounded-full text-white bg-blue-400 w-10 h-10 border border-gray-300 flex justify-center items-center">
				        {{userCircle}}
				    </div>
				</template>

				<script>
				    export default {
				        name: 'UserCircle',

				        props: [
				            'name'
				        ],

				        computed: {
				            userCircle() {
				                return this.name.match(/[A-Z]/g).slice(0, 2).join('');
				            }
				        }
				    }
				</script>

				<style>

				</style>


	[8.7] CRUD for contact
		#Display all contacts of authenticated user
			#resources->js->components->views->Contacts.vue
				<template>
				    <ContactsList endpoint="/api/contacts"/>
				</template>

				<script>
				    import ContactsList from './ContactsList'

				    export default {
				        name: 'Contacts',

				        components: {ContactsList},
				    }
				</script>

				<style>

				</style>

		#Child component ContactsList
			#resources->js->components->views->ContactsList.vue
				<template>
				    <div class="w-full">
				        <div v-if="loading">
				            Loading...
				        </div>

				        <div v-else>
				            <div v-if="contacts.length === 0">
				                <router-link to='/create' class="flex items-center m-2">
				                    <p>Contacts do not exist. Create one.                </p>
				                </router-link>
				            </div>

				            <div v-for="contact in contacts" :key="contact.id">
				                <div >
				                    <router-link :to="'/contacts/' + contact.data.id'" class="flex pt-8 flex items-center border-b border-gray-400 p-4 hover:bg-blue-100" >
				                        <UserCircle v-if="contact.data.name" :name="contact.data.name[0]"/>

				                        <div class="pl-6">
				                            <p class="text-blue-600 font-bold">{{contact.data.name}}</p>
				                            <p class=" text-sm">{{contact.data.company}}</p>
				                        </div>
				                    </router-link>
				                </div> 
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import UserCircle from './UserCircle'

				    export default {
				        name: 'ContactsList',

				        components: {UserCircle},

				        props: [
				            'endpoint'
				        ],

				        data() {
				            return {
				                loading: true,
				                model: false,
				                contacts: ''
				            }
				        },

				        created() {
				            axios.get(this.endpoint)
				                .then(res => {
				                    this.contacts = res.data.data;
				                    this.loading = false;
				                    console.log(res)
				                })
				                .catch(errors => {
				                    this.loading = true;
				                    alert('Unabel to fetch contacts')
				                });
				        },

				    }
				</script>

				<style>

				</style>

		#List birthdays of curruent month of logged in user
			#resources->js->components->views->DisplayContact.vue
				<template>
				    <ContactsList endpoint="/api/birthdays"/>
				</template>

				<script>
				    import ContactsList from './ContactsList'

				    export default {
				        name: 'Birthdays',

				        components: {ContactsList},
				    }
				</script>

				<style>

				</style>

		#Display a selected contact
			#resources->js->components->views->DisplayContact.vue
				<template>
				    <div class="w-full">
				        <div v-if="loading">
				            Loading...
				        </div>

				        <div v-else>
				            <div class="flex items-center justify-between">
				                <a href="#" class="text-blue-400" @click="$router.back()">
				                    Back
				                </a>

				                <div class="relative">
				                    <router-link :to="'/contacts/' + contact.id + '/edit'" class="px-4 py-2 border border-blue-400 text-blue-400 text-sm rounded">Edit</router-link>
				                    <a class="px-4 py-2 border border-red-500 text-red-500 text-sm rounded" @click="model = ! model">Delete</a>

				                    <div v-if="model" class="absolute bg-blue-900 rounded-lg text-white w-64 right-0 z-10 mt-2 p-3">
				                        <p>Are you sure you want to delete this contact?</p>
				                        
				                        <div class="flex items-center justify-end mt-3">
				                            <button @click="model=false" class="text-sm">Cancel</button>
				                            <button @click="deleteContact" class="ml-6 px-4 py-2 bg-red-500 rounded text-sm">Delete</button>
				                        </div>
				                        
				                    </div>
				                </div>

				                <div v-if="model" class="bg-black opacity-25 absolute z-0 left-0 top-0 right-0 bottom-0" @click="model=false"></div>

				            </div>

				            <div class="flex pt-8 flex items-center">
				                <UserCircle v-if="contact.name" :name="contact.name[0]"/>

				                <div class="pl-6">
				                    {{contact.name}}
				                </div>
				            </div>

				            <p class="pt-8 text-gray-600 uppercase text-sm font-bold">Email</p>
				            <p class="pt-1 text-blue-600">{{contact.email}}</p>

				            <p class="pt-8 text-gray-600 uppercase text-sm font-bold">Company</p>
				            <p class="pt-1 text-blue-600">{{contact.company}}</p>

				            <p class="pt-8 text-gray-600 uppercase text-sm font-bold">Birthday</p>
				            <p class="pt-1 text-blue-600">{{contact.birthday}}</p>
				        </div>
				    </div>
				</template>

				<script>
				    import UserCircle from './UserCircle'

				    export default {
				        name: 'DisplayContact',

				        components: {UserCircle},

				        data() {
				            return {
				                loading: true,
				                model: false,
				                contact: ''
				            }
				        },

				        created() {
				            axios.get('/api/contacts/' + this.$route.params.id)
				                .then(res => {
				                    this.contact = res.data.data;
				                    //console.log(this.contact);
				                    this.loading = false;
				                })
				                .catch(errors => {
				                    this.loading = true;

				                    if(errors)
				                    {
				                        this.$router.push('/contacts');
				                    }
				                });
				        },

				        methods: {
				            deleteContact() {
				                axios.delete('/api/contacts/' + this.$route.params.id)
				                    .then(res => {
				                        this.$router.push('/contacts');
				                    })
				                    .catch(errors => {
				                        alert('Inrernal Error! Enable to delete the contact.')

				                        if(errors.res.status === 404)
				                        {
				                            this.$router.push('/contacts');
				                        }
				                    });
				            }
				        }
				    }
				</script>

				<style>

				</style>

		#Create a contact
			#resources->js->components->views->CreateContact.vue
				<template>
				    <div>
				        <form @submit.prevent="createContact">
				            <InputField name="name" label="Name" placeholder="Contact Name" :errors="errors" @updatingField="createForm.name = $event"/>
				            <InputField name="email" label="Email" placeholder="Contact Email" :errors="errors" @updatingField="createForm.email = $event"/>
				            <InputField name="company" label="Company" placeholder="Contact Company" :errors="errors" @updatingField="createForm.company = $event"/>
				            <InputField name="birthday" label="Birthday" placeholder="mm/dd/yyyy" :errors="errors" @updatingField="createForm.birthday = $event"/>

				            <div class="flex justify-end">
				                <button class="rounded text-white py-2 px-4 bg-blue-400 hover:bg-blue-500">Save</button>
				                <button class="ml-2 rounded text-red-400 py-2 px-4 bg-gray-200 hover:bg-gray-300">Cancel</button>
				            </div>
				        </form>
				    </div>
				</template>

				<script>
				    import InputField from './InputField'

				    export default {
				        name: 'CreateContact',

				        components: {InputField},

				        data() {
				            return {
				                createForm: {
				                    name: null,
				                    email: null,
				                    company: null,
				                    birthday: null
				                },
				                errors: null
				            }
				        },

				        methods: {
				            createContact() {
				                axios.post('api/contacts', this.createForm)
				                    .then(res => {
				                        this.$router.push(res.data.links.self)
				                    })
				                    .catch(errors => console.log(this.errors = errors.response.data.errors));
				            },
				        }
				    }
				</script>

				<style>

				</style>

		#Child component InputField
			#resources->js->components->views->InputField.vue
				<template>
				    <div class="relative pb-8">
				        <label :for="name" class="text-blue-500 text-xs font-bold absolute p-1">{{label}}</label>
				        <input :id="name" class="pt-8 pb-2 p-1 w-96 border-b focus:outline-none focus:border-blue-400 text-gray-900 text-sm" :class="changeColor()" v-model="value" :placeholder="placeholder" type="text" @input="updateField()">
				    
				        <p v-if='errors' v-text="errorMessage()" class=" p-1 text-xs text-red-500"></p>
				    </div>
				</template>

				<script>
				    export default {
				        name: 'InputField',

				        props: [
				            'name', 'label', 'placeholder', 'errors', 'data'
				        ],

				        data() {
				            return {
				                value: ''
				            }
				        },

				        methods: {
				            updateField() {
				                this.$emit('updatingField', this.value)
				                
				                this.clearError(this.name)
				            },

				            clearError() {
				                if(this.errors) {
				                    this.errors[this.name][0] = null
				                }
				            },

				            errorMessage() {
				                return this.errors[this.name][0]
				            },

				            changeColor() {
				                return {
				                    'hasError': this.errors && this.errors[this.name][0]
				                }
				            }
				            
				        },
				        
				        watch: {
				            data(val) {
				                this.value = val;
				            } 
				        }
				    }
				</script>

				<style>
				    .hasError {
				        @apply .border-b-2 border-red-500
				    }
				</style>

		#Edit a contact
			#resources->js->components->views->EditContact.vue
				<template>
				    <div>
				        <div class="flex items-center justify-between">
				            <a href="#" class="text-blue-400" @click="$router.back()">
				                Back
				            </a>
				        </div> 
				        
				    
				        <form class="mt-8" @submit.prevent="editContact">
				            <InputField :data="editForm.name" name="name" label="Name" placeholder="Contact Name" :errors="errors" @updatingField="editForm.name = $event"/>
				            <InputField :data="editForm.email" name="email" label="Email" placeholder="Contact Email" :errors="errors" @updatingField="editForm.email = $event"/>
				            <InputField :data="editForm.company" name="company" label="Company" placeholder="Contact Company" :errors="errors" @updatingField="editForm.company = $event"/>
				            <InputField :data="editForm.birthday" name="birthday" label="Birthday" placeholder="mm/dd/yyyy" :errors="errors" @updatingField="editForm.birthday = $event"/>

				            <div class="flex justify-end">
				                <button class="rounded text-white py-2 px-4 bg-blue-400 hover:bg-blue-500">Save</button>
				                <a @click="$router.back()" class="ml-2 rounded text-red-400 py-2 px-4 bg-gray-200 hover:bg-gray-300">Cancel</a>
				            </div>
				        </form>
				    </div>
				</template>

				<script>
				    import InputField from './InputField'

				    export default {
				        name: 'EditContact',

				        components: {InputField},

				        data() {
				            return {
				                editForm: {
				                    name: null,
				                    email: null,
				                    company: null,
				                    birthday: null
				                },
				                errors: null
				            }
				        },

				        created() {
				            axios.get('/api/contacts/' + this.$route.params.id)
				                .then(res => {
				                    this.editForm = res.data.data;
				                })
				                .catch(errors => {
				                    if(errors)
				                    {
				                        this.$router.push('/contacts');
				                    }
				                });
				        },

				        methods: {
				            editContact() {
				                axios.put('/api/contacts/' + this.$route.params.id, this.editForm)
				                    .then(res => {
				                        this.$router.push(res.data.links.self)
				                    })
				                    .catch(errors => console.log(this.errors = errors.response.data.errors));
				            },
				        }
				    }
				</script>

				<style>

				</style>

		#Make the logout work
			#resources->js->components->views->Logout.vue
				<template>
  
				</template>

				<script>
				    export default {
				        name: 'Logout',

				        created() {
				            axios.post('/logout', {})
				                .finally(res => {
				                    window.location = '/login'
				                })
				        }
				    }
				</script>

				<style>

				</style>

	[8.8] Perform search in the SearchBar component 
		#Modify the SearchBar component			
			#resources->js->components->views->SearchBar.vue
				<template>
				    <div class="h-16 px-3 border-b-2 border-gray-400 flex items-center justify-between">
				        <div class="">
				            contacts
				        </div>

				        <div class="flex">
				            <SearchTab/>
				            <UserCircle :name="name"/>
				        </div>
				    </div>
				</template>

				<script>
				    import UserCircle from './views/UserCircle'
				    import SearchTab from './views/SearchTab'

				    export default {
				        name: "SearchBar",

				        components: {UserCircle, SearchTab},

				        props: [
				            'name'
				        ],
				    }
				</script>

				<style>

				</style>

		#Create the new SearchTab component
			#resources->js->components->views->SearchTab.vue
				<template>
				    <div>
				        <div v-if="focus" @click="focus=false" class="bg-black absolute opacity-25 right-0 left-0 top-0 bottom-0 z-10"></div>
				        
				        <div class="relative z-10">
				            <div class="absolute">
				                <svg class="h-8 w-8 pt-2 pl-2 fill-current text-gray-700" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				                viewBox="0 0 511.999 511.999" style="enable-background:new 0 0 511.999 511.999;" xml:space="preserve">
				                        <path d="M508.874,478.708L360.142,329.976c28.21-34.827,45.191-79.103,45.191-127.309c0-111.75-90.917-202.667-202.667-202.667
				                            S0,90.917,0,202.667s90.917,202.667,202.667,202.667c48.206,0,92.482-16.982,127.309-45.191l148.732,148.732
				                            c4.167,4.165,10.919,4.165,15.086,0l15.081-15.082C513.04,489.627,513.04,482.873,508.874,478.708z M202.667,362.667
				                            c-88.229,0-160-71.771-160-160s71.771-160,160-160s160,71.771,160,160S290.896,362.667,202.667,362.667z"/>
				                </svg>
				            </div>
				        
				            <input type="text" placeholder="Search the contacts" id="searchTerm" v-model="contact" @input="searchContacts" @focus="focus=true" class="rounded-full w-64 border border-gray-400 pl-10 p-2 mr-3 focus:outline-none text-sm text-black focus:shadow focus:bg-gray-100 focus:border-blue-600">
				        
				            <div v-if="focus" class="absolute bg-blue-900 text-white rounded-lg- p-4 w-96 right-0 mr-6 mt-2 shadow z-20">
				                <div v-if="searchResult == 0">No Result found for '{{contact}}'</div>
				                
				                <div v-for="result in searchResult" :key='result.id' @click="focus=false">
				                    <router-link :to="result.links.self">
				                        <div class="flex items-center">
				                            <UserCircle :name="result.data.name" class="mr-3"/>
				                            {{result.data.name}}
				                        </div>
				                    </router-link>
				                </div>
				            </div>
				        
				        </div>
				        
				    </div>
				</template>

				<script>
				    import _ from 'lodash';
				    import UserCircle from './UserCircle'

				    export default {
				        name: 'SearchTab',

				        components: {UserCircle},

				        data() {
				            return {
				                contact: '',
				                searchResult: [],
				                focus: false
				            }
				        },

				        methods: {
				            searchContacts: _.debounce(function (e) {
				                if(this.contact.length < 2) {
				                    return
				                }

				                axios.post('/api/search', {searchTerm: this.contact})
				                    .then(res => {
				                        this.searchResult = res.data.data;
				                        console.log(this.searchResult);
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



9) Upload User Image
	[9.1] Setup the backend to store in the database
		#Add avatar column in the user table
			#database->migrations->create_users_table
					public function up()
				    {
				        Schema::create('users', function (Blueprint $table) {
				            $table->id();
				            $table->string('name');
				            $table->binary('avatar')->nullable();
				            $table->string('email')->unique();
				            $table->timestamp('email_verified_at')->nullable();
				            $table->string('password');
				            $table->rememberToken();
				            $table->string('api_token');
				            $table->timestamps();
				        });
				    }

		#refresh and migrate the database
			php artisan migrate:refresh

		#Make request 
			php artisan make:request ImageRequest

			#Make the rule that image is required
				#app->Http->Requests->ImageRequest
					<?php

					namespace App\Http\Requests;

					use Illuminate\Foundation\Http\FormRequest;

					class ImageRequest extends FormRequest
					{

					    public function authorize()
					    {
					        return true;
					    }

					    public function rules()
					    {
					        return [
					            'image' => 'required'
					        ];
					    }
					}


		#Make Controller
			php artisan make:controller ImageController

			#Add ImageRequest and create upload()
				#app->Http->Controllers->ImageController
					<?php

					namespace App\Http\Controllers;

					use Illuminate\Http\Request;
					use App\Http\Requests\ImageRequest;


					class ImageController extends Controller
					{
					    public function upload(ImageRequest $request)
					    {
					        $request->user()->avatar = $request->image;
					        $request->user()->save();

					        return response(null, 200);
					    }
					}

			//php artisan storage:link (Not required while working with vue)

		#Add upload route
			#routes->web.php
				<?php

				use Illuminate\Support\Facades\Route;

				Auth::routes();

				Route::post('/logout', function() {
				    request()->session()->invalidate();
				});

				Route::post('/upload', 'ImageController@upload');

				Route::get('/{any}', 'HomeController@index')->where('any', '.*');

	[9.2] Upload and display of the frontend
		#Pass authenticated user to ExampleComponent
			#resources->js->components->App.vue
				<template>
				    <div class="h-screen bg-white">
				        <div class="flex">
				            <Toolbar/>

				            <div class="flex flex-col flex-1 h-screen">
				                <SearchBar :name="user.name" :avatar="user.avatar"/>

				                <div class="flex overflow-y-hidden">
				                    <router-view  :user="user" class="p-6 overflow-x-hidden"></router-view>
				                </div>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import Toolbar from './Toolbar'
				    import SearchBar from './SearchBar'

				    export default {
				        name: "App",

				        props: [
				            'user'
				        ],

				        created() {
				            window.axios.interceptors.request.use(
				                (config) => {
				                    if(config.method === 'get') {
				                        config.url = config.url + '?api_token=' + this.user.api_token;
				                    }
				                    else {
				                        config.data = {
				                            ...config.data,
				                            api_token: this.user.api_token  
				                        };
				                    }
				                    
				                    return config;
				                }
				            )
				        },

				        components: {Toolbar, SearchBar}
				    }
				</script>

				<style>

				</style>

		#Edit the ExampleComponent
			#resources->js->components->ExampleComponent.vue
				<template>
				    <div class="">
				        <div v-if="!hasImage">
				            <input type="file" name='image' @change="getImage">
				        
				            <img :src="uploadedImage" alt="profilePic">

				            <a href="#" @click.prevent="upload">Upload</a>
				        </div>
				        
				        <!-- Design -->
				        <div v-else class="max-w-sm rounded overflow-hidden shadow-lg">
				            <img class="w-full" :src="uploadedImage" alt="Profile Pic">
				            
				            <div class="px-6 py-4">
				                <div class="font-bold text-xl mb-2">Welcome {{user.name}}</div>
				                <p class="text-gray-700 text-base">
				                This is an amazing Contact Birthday SPA
				                </p>
				            </div>

				            <div class="px-6 py-4">
				                <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{{user.name}}</span>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    export default {
				        name: "ExampleComponent",

				        props: [
				            'user'
				        ],

				        data() {
				            return {
				                uploadedImage: this.user.avatar,
				                hasImage: false
				            }
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

				            upload() {
				                axios.post('/upload', {'image': this.uploadedImage})
				                    .then(this.hasImage = true)
				                    .catch()
				                
				            }
				        }
				    }
				</script>

				<style>

				</style>



10) Finalize the project
	[10.1] Change the document title along with page title
		#Add meta in the router
			#resources->js->router->router.js
				import Vue from 'vue';
				import VueRouter from 'vue-router';

				import ExampleComponent from '../components/ExampleComponent'
				import CreateContact from '../components/views/CreateContact'
				import DisplayContact from '../components/views/DisplayContact'
				import EditContact from '../components/views/EditContact'
				import Contacts from '../components/views/Contacts'
				import Birthdays from '../components/views/Birthdays'
				import Logout from '../components/views/Logout'


				Vue.use(VueRouter);

				export default new VueRouter({
				    routes: [
				        { 
				            path: '/', component: ExampleComponent,
				            meta: {title: 'Welcome'}
				        },
				        { 
				            path: '/contacts', component: Contacts,
				            meta: {title: 'List of contacts'}
				        },
				        { 
				            path: '/birthdays', component: Birthdays,
				            meta: {title: 'Birthdays'}
				        },
				        { 
				            path: '/create', component: CreateContact,
				            meta: {title: 'Add new contact'}
				        },
				        { 
				            path: '/contacts/:id', component: DisplayContact,
				            meta: {title: 'Details'}
				        },
				        { 
				            path: '/contacts/:id/edit', component: EditContact,
				            meta: {title: 'Edit contact'}
				        },
				        { 
				            path: '/logout', component: Logout,
				            meta: {title: 'Logout'}
				        },
				    ],
				    mode: 'history',
				    hash: false
				});

		#Add watch in the App component and pass the title to SearchBar
			#resources->js->components->App.vue
				<template>
				    <div class="h-screen bg-white">
				        <div class="flex">
				            <Toolbar/>

				            <div class="flex flex-col flex-1 h-screen">
				                <SearchBar :name="user.name" :title="title"/>

				                <div class="flex overflow-y-hidden">
				                    <router-view  :user="user" class="p-6 overflow-x-hidden"></router-view>
				                </div>
				            </div>
				        </div>
				    </div>
				</template>

				<script>
				    import Toolbar from './Toolbar'
				    import SearchBar from './SearchBar'

				    export default {
				        name: "App",

				        props: [
				            'user'
				        ],

				        data() {
				            return {
				                title: ''
				            }
				        },

				        watch: {
				            $route(to, from) {
				                this.title = to.meta.title;
				            },

				            title() {
				                document.title = this.title + ' | BirthdaySPA'
				            }
				        },

				        created() {
				            this.title = this.$route.meta.title;

				            window.axios.interceptors.request.use(
				                (config) => {
				                    if(config.method === 'get') {
				                        config.url = config.url + '?api_token=' + this.user.api_token;
				                    }
				                    else {
				                        config.data = {
				                            ...config.data,
				                            api_token: this.user.api_token  
				                        };
				                    }
				                    
				                    return config;
				                }
				            )
				        },

				        components: {Toolbar, SearchBar}
				    }
				</script>

				<style>

				</style>

		#Catch the prop and display title in the SearchBar
			#resources->js->components->SearchBar.vue
				<template>
				    <div class="h-16 px-3 border-b-2 border-gray-400 flex items-center justify-between">
				        <div class="">
				            {{title}}
				        </div>

				        <div class="flex">
				            <SearchTab/>
				            <UserCircle :name="name"/>
				        </div>
				    </div>
				</template>

				<script>
				    import UserCircle from './views/UserCircle'
				    import SearchTab from './views/SearchTab'

				    export default {
				        name: "SearchBar",

				        components: {UserCircle, SearchTab},

				        props: [
				            'name', 'title'
				        ],
				    }
				</script>

				<style>

				</style>













		

		






























        
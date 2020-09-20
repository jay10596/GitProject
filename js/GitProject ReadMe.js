1) Connect GitHub to GitKraken
	
	1.1 Once authenticated, go to Preferences->Integration.

	1.2 It should display GitHub account with SSH key.
		 
		SSH key works as a communicating bridge between GitHub and GitKraken.



2) Start a local repository

	2.1 Start a local repo->Init

	2.2 Add name of the repo: GitProject
		
		Initialize the path of the GitProject (GitKraken) folder
		
		Add anything in GitIgnore. 

		Add Default branch name as Master.

		Create Repository. // It will create a new folder called GitProject inside the path mentioned above.



3) .gitignore

	3.1 GitProject folder contains .jpg files and Git does not work well 		with images. 

		We will ignore them using .gitignore. .gitignore is always hidden.

		Make it visible: 
			defaults write com.apple.Finder AppleShowAllFiles true

			killall Finder

	3.2 Edit .gitignore

		#.gitignore //images folder does not exist, but it's just an example.

			# Exclude all files with .jpg extention 
			*.jpg

			# Exclude all files of the images folder
			/images/*

			# Exclude all .jpg files of the images folder
			/images/*.jpg 
/**/

4) Stage and Commit
	
	4.1 On the right block of GitKraken
		
		the top block: Unstaged files WIP (Work in progress)

		The middle block: Staged files

		The bottom block: Commited files

	4.2 Make changes in the file and commit

		#AP_Crispy_Baked_Wrappers.txt

			Add a new line in the description and add servings, prep time and recipe by from AP_Additional_Text.

			Click on the file in Unstaged Files(WIP). It will display what's been changed. Discard Hunk on description and Stage Hunk on servings, prep time and recipe.

			Add summary in description and press commit.

			The original file will have servings, prep time and recipe but not additionally added line in description despite the fact that we originally saved it. It's because we Descarded the addtional line of description Hunk.



5) Revert unstaged files back to the previous commit

	5.1 Make an unwanted change by complely removing the description and save the file.

	5.2 Go to Unstaged Files (WIP) and click on Discard all changes. The original file will have the description same as the last commit.



6) Revert commited files back to the previous commit

	6.1 Make an unwanted change by complely removing the description and save the file.

	6.2 Stage all changes and Commit the file "Description Removed".

	6.3 Right click on the "Description Removed" commit of the tree and click Revert Commit.

	6.4 Check the original file. It will have the description same as the previous commit.



7) Search

	7.1 Search the commit using the search bar. It will match it with commit name and description of it.

	7,2 Search the file history. Command + p -> history -> File Name. It will show all the commits of that specific file.



8) Branch Merge

	8.1 Create a new branch by right click on the master. Give the name "DS_Update" based on why we are creating that branch and do not use space.

	8.2 Add additional description, servings, prep time and recipe in DS_Tiramisu.txt file and save it.

	8.3 Stage all changes and commit. Unline before, now you can see new branch and master on different commits. It was on the same commit previously as there were no new commit after creating a new branch.

	8.4 Add dditional point in ingredients and directions of DS_Tiramisu.txt file and save it.

	8.5 Stage all changes and commit. Now the new branch will be 2 steps ahead of the master branch.

	8.6 Drag new branch into master and select "Merge DS_Update into master" on the pop-up.



9) Merge without Rebase i.e Simple merge// No need to rebase if there are no changes in the master branch in the mean time while you are working on a seperate branch.

	9.1 Make a new branch "MC_Update_Without_Rebase"

	9.2 Add additional description in MC_Shrimp_Garlic_Pasta.txt. Stage and commit changes.

	9.3 Change back to the master branch. There is a button on the top to change the branch. The additional description line will be gone.

	9.4 Add servings, prep time and recipe by in MC_Shrimp_Garlic_Pasta.txt. Stage and commit changes.

	9.5 Drag "MC_Update_Without_Rebase" into master and select "Merge MC_Update_Without_Rebase into master".

	9.6 Now, MC_Shrimp_Garlic_Pasta.txt in the master will contain both, additional description and servings, preptime, and recipe. 



10) Merge with Rebase 

	10.1 Make a new branch "MC_Update_With_Rebase"

	10.2 Change recipe by from 'Jay' to 'Jay N. Modi' in MC_Shrimp_Garlic_Pasta.txt. Stage and commit changes.

	10.3 Change back to the master branch. Recipe by will be back to "Jay"

	10.4 Add Allergy Warnings in MC_Shrimp_Garlic_Pasta.txt. Stage and commit changes.

	10.5 Drag "MC_Update_With_Rebase" into master and select "Rebase MC_Update_With_Rebase onto master". Tree structure will change and MC_Update_With_Rebase and master will become a single line rather than split.

	10.6 Drag "MC_Update_With_Rebase" into master and select "Merge MC_Update_With_Rebase into master". Tree structure will change again and MC_Update_With_Rebase will become a split of master. 

	10.6 Now, MC_Shrimp_Garlic_Pasta.txt in the master will contain both, "Jay N. Modi" and Allergy Warnings. 

// Check the tree structure of MC_Update_With_Rebase and MC_Update_Without_Rebase for better understanding.



11) Handle Conflicts
	
	11.1 Make a new branch "AP_Update_With_Conflict"

	11.2 Change recipe by from " " to "Jay N. Modi" in AP_Crispy_Baked_Wrappers.txt. Stage and commit changes.

	11.3 Change back to the master branch. Recipe by will be back to " "

	11.4 Change recipe by from " " to "Smit N. Modi" in AP_Crispy_Baked_Wrappers.txt. Stage and commit changes.

	11.5 Drag "AP_Update_With_Conflict" into master and select "Rebase AP_Update_With_Conflict onto master". Rebase will fail because there will be conflict.

	11.6 Click on file in the conflict secion and it will show the coflict in Recipe By line in both master and AP_Update_With_Conflict branch.

	11.7 Click on one of the checkboxes that you prefer and press save. Press Continue Rebase.

	11.8 Drag "AP_Update_With_Conflict" into master and select "Merge AP_Update_With_Conflict into master". Tree structure will change again and AP_Update_With_Conflict will become a split of master. 

	11.9 Now, AP_Crispy_Baked_Wrappers.txt in the master will contain Recipe By with "Jay N. Modi". 



12) Stashes

	12.1 Add "Download from my website" (a change that you are not sure about) in the last line of in DS_Tiramisu.txt and save the file.

	12.2 Select that WIP and click stash. The DS_Tiramisu.txt will not have that change anymore.

	12.3 Add Soy Milk in ingredidents in DS_Tiramisu.txt. Stage and commit changes.

	12.4 Now that you are sure about the change "Download from my website", click on the stash and press pop. Now stage and commit changes.

	12.5 The working file DS_Tiramisu.txt will have all both, Soy milk in ingredients and Download from website at the nd of the file.



13) Connect to GitHub (Push)
	
	13.1 Create a new repo and copy the SSH origin for that repo

	13.2 In the sidebar of GitKraken, click on remote->URL->add name. In Push/Pull url, paste origin. Press ok. If password is asked, enter SSH password.

	13.3 Click Push from the navbar. What Branch: master. Once successfull, it will display GitHub logo in front of master.

	13.4 Make change in any file. Stage, commit and push changes.



14) Pull // To get the code from existing GitHub repo. 
	
	14.1 Edit google Link in the file AP_Crispy_Baked_Wrappers.txt from GitHub and commit changes.

	14.2 Within 60 secs, GitKraken will be updated by itself and we will see a new commit from the GitHub master branch.

	14.3 As the GitHub master is currently 1 step ahead of the local master, we need to pull.

	14.4 Click Pull from the navbar. The AP_Crispy_Baked_Wrappers.txt file will be updated in the local computer. Check it mannually. It will have the google link in it.


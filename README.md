# personalized-game-controller
A video game controller UI with clickable buttons personalized to our group members. You can enter button press combinations to trigger various interactive visualizations.


# RUN INSTRUCTIONS FOR TEAM ONLY


Graders, ignore these instructions.


**DO NOT**:
1. modify the .gitignore
2. commit directly to the 'main' branch
3. commit directly to the 'dev' branch
3. commit directly to the 'deploy' branch


**IF RUNNING FOR FIRST TIME**:
1. `git clone` this repo
2. `cd` personalized-game-controller
3. `git checkout main`
4. `git pull`
5. `git checkout dev`
6. `git pull`


Then, create your own branch:


7. `git checkout -b YOURNAME-branch`


To build (on MacOS with Homebrew) from the repo root:


Note: If you're on Windows, good luck! ChatGPT is your best bet.


8. `npm install`
9. `brew install ruby`
10. `echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc`
11. `source ~/.zshrc`
12. `gem install slim`


Now verify that ruby and slimrb are correctly installed:


13. `which ruby` → should display a file path
14. `which slimrb` → should display a file path. Once working, skip to step 17


*If step 14 says slimrb is not found*:


15. `ruby -e 'puts Gem.bindir'` → should display a file path for slimrb. Copy that path.
16. `echo 'export PATH="YOUR-PATH-HERE"' >> ~/.zshrc`
17. `source ~/.zshrc`
18. verify again with step 14


To commit your branch:


19. `git add .`
20. `git commit -m "your-commit-message"`
21. `git push -u origin your-branch-name`


Once Step 12 works and you've committed your branch, proceed to the "TO BUILD" section. From now on you should just be able to build. To commit your branch:


**TO BUILD**:


I've setup package.json so that you can generate HTML and build this thing with one command. Before doing that, VSCode users ensure the following extensions are installed (if you don't already have them):


1. Live Server
2. optional: Stylus (for language support)
3. optional: Slim (for language support)


Then to build from the root directory:


1. `npm run build`
2. open the index.html file that should be inside /src
3. Hit 'Go Live' (bottom right corner of VSCode window)


# INSTRUCTIONS FOR DEVELOPMENT


This project generates HTML (i.e. the index.html file) from a slim script. The CSS stylesheet (style.css) is likewise generated from a style.stylus file.


**Do not edit the HTML and CSS files directly**. You should instead edit:


1. index.slim to modify index.html
2. style.stylus to modify style.css
3. script.js for application behaviour (this is just native js)
4. Add new files as needed, but any HTML/CSS needs to be hooked into index.slim.


The generated html already links the css stylesheet. Every time you modify either index.slim or style.stylus, you must run:


1. `npm run build`


again to regenerate the html and CSS. 


If you need some guidance on how/where to add your own animations to the code -- check out some of the comments I've left in index.slim and style.stylus.


**Some commands I added to package.json that you may find useful**:


open two separate terminals, then run one of the following commands in each terminal:


1. `npm run watch:slim` 
2. `npm run watch:stylus`


This allows you to see live changes in each index.slim and style.stylus without having to re-run `npm run build` every single time. All you need to do is hit save while working on either of those files and things should update in real-time.


**Important**:


Once you're happy with your changes and tested them, commit them to your branch and open a pull request to 'dev' (i.e. **NOT** main). Once checked and closed by another team member, I'll test the dev branch and merge into 'main'.


**Current Branches**:

please add your own branches
1. main → deployment to gh-pages from here.
2. dev → integration branch, merges to main.
3. JARIN-branch → merges to dev only

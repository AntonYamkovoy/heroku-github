
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');


let langData= fs.readFileSync('data/lang.json');
let reposData = fs.readFileSync('data/repos.json');
let userData = fs.readFileSync('data/users.json');
let commitData = fs.readFileSync('data/commits.json');
let repo_contributors = fs.readFileSync('data/repo_contributors.json');
let repo_lang = fs.readFileSync('data/repo_lang.json');
let test_data = fs.readFileSync('data/test.json');



let repo_langs = JSON.parse(repo_lang);
let lang_list = JSON.parse(langData);
let repo_list = JSON.parse(reposData);
let user_list = JSON.parse(userData);
let commit_list = JSON.parse(commitData);
let repo_cont = JSON.parse(repo_contributors);
let test_json = JSON.parse(test_data);
var chart_json;
var graph_json;
var radar_json;


//console.log(langList);
const app = express()
//makeRadarData("ALl",repo_langs);
//makeUserData("11LiveChat",user_list,repo_cont); //working
// make repo list filtered by lang
//makeLangData("All",repo_list,repo_langs);
//makeLangData("Go",repo_list,repo_langs);

// Make graph all test cases working
//makeGraphData("All","All",commit_list,repo_cont,repo_list,user_list);
//makeGraphData("All","cloudwebrtc",commit_list,repo_cont,repo_list,user_list);
//makeGraphData("11LiveChat","All",commit_list,repo_cont,repo_list,user_list);
//makeGraphData("11LiveChat","cloudwebrtc",commit_list,repo_cont,repo_list,user_list);

//Make Chart all test cases
//makeChartData("All","All",commit_list);
//makeChartData("All","cloudwebrtc",commit_list);
//makeChartData("11LiveChat","All",commit_list);
//makeChartData("11LiveChat","cloudwebrtc",commit_list);

app.use(express.static('public'));
//app.use(express.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Parse JSON bodies (as sent by API clients)
//app.use(express.json());
var qs = require('querystring');

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  var sel_lang = "Go";
  var sel_repo = "flutter";
  var sel_user = "All";
  chart_json = makeChartData2(sel_repo,sel_user,commit_list);
  graph_json = makeGraphData(sel_repo,sel_user,commit_list,repo_cont,repo_list,user_list);
  radar_json = makeRadarData(sel_lang,repo_langs);
  res.render('index', {langList: lang_list,reposList:repo_list,userList:user_list,selected_lang:sel_lang, selected_repo:sel_repo, selected_user:sel_user});
})
app.post('/', function (req, res) {
  chart_json = makeChartData2(req.body["repo"],req.body["user"],commit_list);
  graph_json = makeGraphData(req.body["repo"],req.body["user"],commit_list,repo_cont,repo_list,user_list);
  radar_json = makeRadarData(req.body["lang"],repo_langs);
    console.log(req.body["lang"]);
    console.log(req.body["repo"]);
    console.log(req.body["user"]);
  res.render('index', {langList: lang_list,reposList:repo_list,userList:user_list, selected_lang:req.body["lang"], selected_repo:req.body["repo"], selected_user:req.body["user"]});
})
app.get('/chart', function(req,res){
  res.json(chart_json);
})

app.get('/graph', function(req,res){
  res.json(graph_json);
})

app.get('/radar', function(req,res){
  res.json(radar_json);
})



app.get('/repolang', function(req,res){
  param = get_param(req);
  console.log(param.lang);
  res.json(makeLangData(param.lang,repo_list,repo_langs));
})

app.get('/repouser', function(req,res){
  param = get_param(req);
  console.log(param.repo);
  res.json(makeUserData(param.repo, user_list, repo_cont));
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})


function makeRadarData(lang, repo_langs) {
  let map = new Map();
  let resMap = new Map();
  var dataArray = []
  var langsInRepo = []
  repos_list = makeLangData(lang,repo_list,repo_langs);
  for(var repo in repo_list) {
      langsInRepo = []
      for(var key in repo_langs) {
        if(repo_langs[key].repo_name == repo_list[repo].repo_name) {
          langsInRepo.push({"lang":repo_langs[key].lang});

        }
      }
      console.log(langsInRepo);
      for(i in langsInRepo) {

          if(!map.has(langsInRepo[i].lang )) {
            map.set(langsInRepo[i].lang, 0);
          }

          else {
            map.set(langsInRepo[i].lang, (map.get(langsInRepo[i].lang))+1);
          }
      }
    }
    const obj = mapToObj(map);
    for(key in obj) { dataArray.push({"key":key, "value":obj[key], "category":0});  }
    specific_repos = makeLangData(lang,repo_list,repo_langs);
    desiredLangs = []
    //console.log(specific_repos);
    for(i in repos_list) {
      for(j in repo_langs) {
          if(repos_list[i].repo_name == repo_langs[j].repo_name) {
            desiredLangs.push(repo_langs[j].lang)
          }
      }
    }
    var resultArray = []

    uniqueLangs = desiredLangs.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);

    console.log("DesiredLangs "+ uniqueLangs);


    for(var d in uniqueLangs) {
        for(var k in dataArray) {
            if(dataArray[k].key == uniqueLangs[d]) {
              // add to final list
              resultArray.push({"key":dataArray[k].key,"value":dataArray[k].value,"category":0});

            }

        }

    }
    return resultArray;
}

function mapToObj(inputMap) {
    let obj = {};

    inputMap.forEach(function(value, key){
        obj[key] = value
    });

    return obj;
}










function makeUserData(repo,user_list,repo_contributors) {
  var dataArray = []
  if(repo == "All") {
    for(var key in user_list) {
      dataArray.push({"login":user_list[key].login});
    }

  }
  else {

    for(var key2 in repo_contributors) {
        if(repo_contributors[key2].repo_name == repo) {

              dataArray.push({"login":repo_contributors[key2].login});
        }

    }



  }
  let dataJSON = JSON.stringify(dataArray);
//  fs.writeFileSync('testUsers.json', dataJSON);
  return dataArray;


}


// returns a list of repos for a given language
function makeLangData(language,repo_list,repo_langs) {
    var dataArray = []

    if(language == "All") {
      for(key in repo_list) {
        dataArray.push({"repo_name":repo_list[key].repo_name});
      }
    }
    else {
      for(var key in repo_langs) {
          if(repo_langs[key].lang == language) {
            //if(!dataArray.includes({"repo_name":repo_langs[key].repo_name})) {
                dataArray.push({"repo_name":repo_langs[key].repo_name});
          //  }
          }

      }
    }

  //  var dataArray2 = dataArray[0];
    let dataJSON = JSON.stringify(dataArray);
    //fs.writeFileSync('testLang.json', dataJSON);
    return dataArray;


}

function get_param(req){
  let q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}

function makeChartData(repo, login, commit_list) {
    var chart_json;
    var temp_list = commit_list;
    if(repo == "All" && login == "All") { // removing extra whitespace for comparison
        chart_json = commit_list;

    }
    else if(repo == "All" && login != "All") {
      // all repos of one user case
      var i =temp_list.length;
      while(i--) {

        if (temp_list[i].login != login) {
          // remove from resulting json
          var removed = temp_list.splice(i, 1);
        }
      }
      chart_json = temp_list;


    }
    else if(login == "All"&& repo != "All") {
      // all users 1 repo case

      var i =temp_list.length;
      while(i--) {

        if (temp_list[i].repo_name != repo) {
          // remove from resulting json
          var removed = temp_list.splice(i, 1);
        }
      }

      chart_json = temp_list;

    }
    else {
      // repo and login are single values case
      var i =temp_list.length;
      while(i--) {

        if (temp_list[i].repo_name != repo) {
          // remove from resulting json
          var removed = temp_list.splice(i, 1);
        }
        else if(temp_list[i].login != login) {
          var removed = temp_list.splice(i, 1);
        }
      }
      chart_json = temp_list;

    }
  //let data = JSON.stringify(chart_json);
  //fs.writeFileSync('testChart.json', data);
  return chart_json;
}


function makeChartData2(repo, login, commit_list) {
    if(repo.trim() == "All" && login.trim() == "All") { return commit_list }




      if(repo.trim() == "All") {
          var dataArray = []
          for(var key in commit_list) {
            if(commit_list[key].login == login) {
              // found users commit into any repos
              dataArray.push({"login":login,"repo_name":commit_list[key].repo_name,"dat":commit_list[key].dat});
            }
          }
          return dataArray;

        }


    if(login.trim() == "All") {
      var dataArray = []
      for(var key in commit_list) {
        if(commit_list[key].repo_name == repo) {
          // found users commit into any repos
          dataArray.push({"login":commit_list[key].login,"repo_name":repo,"dat":commit_list[key].dat});
        }
      }
      return dataArray;

    }
    else {
      var dataArray = []
      for(var key in commit_list) {
        if(commit_list[key].login == login && commit_list[key].repo_name == repo) {
          // found users commit into any repos
          dataArray.push({"login":login,"repo_name":commit_list[key].repo_name,"dat":commit_list[key].dat});
        }
      }
      return dataArray;

    }


}


function makeGraphData(repo, login, commit_list,repo_contributors,repo_list,users_list) {
  var graph_json;


  if(repo.trim() == "All" && login.trim() == "All") { // removing extra whitespace for comparison
      // add all user logins as Node(user), add all repos as Repo(user)
      // for each commit to a repo add a link source : commit.login,  target = commit.repo_name, value
      var dataArray = []
      var nodes = []
      var links = []



      var usersList = []
      var reposList = []
      var temp_index = 0;
      for(var key in users_list) {
        usersList.push({"login":users_list[key].login, "index": temp_index, "group": 0});
        nodes.push({"id":users_list[key].login, "group": 0});

        temp_index++;
      }
      for(var key in repo_list) {
        reposList.push({"repo_name":repo_list[key].repo_name, "index": temp_index, "group": 1});
        nodes.push({"id":repo_list[key].repo_name, "group": 1});
        temp_index++;
      }
      console.log("created "+temp_index+" user and repo nodes");
      // each user and repo has an index for links in "usersList" and "reposList"
      // need to add links for each user counting their commits to each one of their repos and creating that links
      count =0;
      for(var key in repo_contributors) {

          var r = repo_contributors[key].repo_name;
          var u = repo_contributors[key].login;
          /*
          for(var c in commit_list) {
            if(commit_list[c].repo_name.trim() == r.trim() && commit_list[c].login.trim() == u.trim()) {
              // found a commit of the user:
              count++;

            }

          }
          */
          // found all users commits


          count =0;

          var sourceIndex = 0;
          var targetIndex =0;
          for(var user in usersList) {
            if(usersList[user].login == u) {
              sourceIndex = usersList[user].index;
            }

          }

          for(var rep in reposList) {
            if(reposList[rep].repo_name == r) {
              targetIndex = reposList[rep].index;
            }

          }



          links.push({"source":sourceIndex,"target":targetIndex,"value":0})
        //  console.log(commitValue)


      }



      dataArray.push({"nodes": nodes, "links": links});
      dataArray = dataArray[0];
      let dataJSON = JSON.stringify(dataArray);
      fs.writeFileSync('testGraph4.json', dataJSON);
      graph_json = dataArray;


  }
  else if(repo.trim() == "All") {
    var dataArray = []
    var nodes = []
    var links = []
    var saved = []

    var count =0;
    var count2 =0;
    var index = repo_contributors.length;
    originalUser = login;
    nodes.push({"id":login, "group": 0, "index" : count});
    count++;

    while(index--) {
      if(repo_contributors[index].login == login) {
          // found repo of given
          /*
          for(var key in commit_list) {
            if(commit_list[key].repo_name == repo_contributors[index].repo_name && commit_list[key].login == login) {
              // found users commit in given repo
              count2++;

            }

          }

          commitList[count] = count2;
          count2 =0

          */

          nodes.push({"id": repo_contributors[index].repo_name , "group": 1});
          var repo_source = count;
          saved.push(repo_source);
          count++;


          for(var key in repo_contributors) {
              if(repo_contributors[key].repo_name == repo_contributors[index].repo_name) {
                if(repo_contributors[key].login  == originalUser) {
                    continue;

                }
                else {
                // find all of repos logins
                nodes.push({"id":repo_contributors[key].login, "group" : 0});


                links.push({"source":repo_source, "target":count, "value":0});

                count++;
              }
              }
          }
          //completed one subtree
      }
      // all subtrees completed links from inital user to it's repos left

    }


    //console.log(count)
/*
      // finished pushing all nodes, there are |count| nodes + 1 (the repo)
    for(var i = 1; i <= count ; i++) {
        links.push({"source":0, "target":i, "value":commitList[i-1]});
    }

    dataArray.push({"nodes": nodes, "links": links});
*/

    for(s in saved) {
      links.push({"source":0, "target":saved[s], "value":0});
    }
    dataArray.push({"nodes": nodes, "links": links});

      dataArray = dataArray[0];
   let dataJSON = JSON.stringify(dataArray);
   fs.writeFileSync('testGraph3.json', dataJSON);
     graph_json = dataArray;


  }
  else if(login.trim() == "All") {

    var dataArray = []
    var nodes = []
    var links = []
    var saved = []

    var count =0;
    var count2 =0;
    var index = repo_contributors.length;
    var originalRepo = repo;
    nodes.push({"id":repo, "group": 2});
    count++;

    for(var index in repo_contributors) {
      if(repo_contributors[index].repo_name == repo) {


          nodes.push({"id": repo_contributors[index].login , "group": 0});
          var user_source = count;
          saved.push(user_source);
          count++;


          for(var key in repo_contributors) {
              if(repo_contributors[key].login == repo_contributors[index].login) {
                if(repo_contributors[key].repo_name  == originalRepo) {
                    continue;

                }
                else {
                  // find all of repos logins
                  nodes.push({"id":repo_contributors[key].repo_name, "group" : 1});


                  links.push({"source":user_source, "target":count, "value":0});

                  count++;
              }
              }
          }
          //completed one subtree
      }
      // all subtrees completed links from inital user to it's repos left

    }




    for(s in saved) {
      links.push({"source":0, "target":saved[s], "value":0});
    }
    dataArray.push({"nodes": nodes, "links": links});

      dataArray = dataArray[0];
   let dataJSON = JSON.stringify(dataArray);
   fs.writeFileSync('testGraph3.json', dataJSON);
     graph_json = dataArray;



  }
  else {

    // repo and login are single values case
    var dataArray = []
    var nodes = []
    var links = []

    nodes.push({"id":login, "group": 0});
    nodes.push({"id":repo, "group": 1});

    links.push({"source": 0, "target": 1, "value": 1});

    dataArray.push({"nodes":nodes, "links": links});

    var dataArray = dataArray[0];

   let dataJSON = JSON.stringify(dataArray);
   fs.writeFileSync('testGraph1.json', dataJSON);

    graph_json = dataArray;


  }



  return graph_json;


}

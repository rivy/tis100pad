from flask import Blueprint, request, render_template, flash, g, session, redirect, url_for, jsonify, redirect
from app import db
from app.model.solution import Solution
from app.model.problem import Problem
from app.model.account import Account

import string

mod = Blueprint('pad', __name__, url_prefix='/pad')

@mod.route('/')
def root():
 return render_template("pad.html")

@mod.route('/<int:solution>')
def routeToRoot(solution):
 return redirect("/pad/#?id=" + str(solution))

@mod.route('/solution/<int:solution>', methods=['POST','GET'])
def getSolution(solution):
 solution = Solution.query.filter_by(id = solution).first()
 problem = Problem.query.filter_by(id = solution.problemId).first()
 username = ''
 account = Account.query.filter_by(id = solution.userId).first()
 if account != None:
  username = account.name
 return jsonify({
  'grid': solution.getRegistersGrid(), 
  'states' : problem.getRegistersGrid(), 
  "problemId" : problem.id , 
  "inputs" : problem.getEntries(),
  "outputs" : problem.getOutput(),
  "name" : problem.name,
  "user" : username ,
  "identifier" : problem.identifier})

@mod.route('/save.json', methods=['POST'])
def save():
 nodes = request.get_json().get("nodes")
 problemId = request.get_json().get("problemId")
 input = request.get_json().get("input")
 output = request.get_json().get("out")

 problemById = Problem.query.filter_by(id = problemId).first()
 userId = None
 if session.has_key("account.id"):
  userId = session["account.id"]
 problemByState = Problem(
  nodes[0][0].get("state"),nodes[0][1].get("state"),nodes[0][2].get("state"),nodes[0][3].get("state"),
  nodes[1][0].get("state"),nodes[1][1].get("state"),nodes[1][2].get("state"),nodes[1][3].get("state"),
  nodes[2][0].get("state"),nodes[2][1].get("state"),nodes[2][2].get("state"),nodes[2][3].get("state"),
  int(input[0]["active"]),int(input[1]["active"]),int(input[2]["active"]),int(input[3]["active"]),
  int(output[0]["active"]),int(output[1]["active"]),int(output[2]["active"]),int(output[3]["active"]),userId)

 if not problemByState.isValid():
  err = ['illegal data']
  return jsonify(errors = err)

 finalProblem = None
 if problemByState == problemById:
  finalProblem = problemById
 else:
  finalProblem = problemByState
  db.session.add(finalProblem)
  db.session.flush()

 solution = Solution( 
  nodes[0][0].get("text"),nodes[0][1].get("text"),nodes[0][2].get("text"),nodes[0][3].get("text"),
  nodes[1][0].get("text"),nodes[1][1].get("text"),nodes[1][2].get("text"),nodes[1][3].get("text"),
  nodes[2][0].get("text"),nodes[2][1].get("text"),nodes[2][2].get("text"),nodes[2][3].get("text"),finalProblem.id,userId)

 if solution.isEmpty():
  err = ['no solution submitted']
  return jsonify(errors = err)

 db.session.add(solution)
 db.session.flush()
 db.session.commit()
 return jsonify(id = solution.id)


@mod.route('/problem.json', methods=['POST'])
def problem():
 problem = None
 if request.get_json().get('identifier'):
  problem = Problem.query.filter_by(identifier =request.get_json().get('identifier')).first()
 if problem == None:
  err = ['unknown problem']
  return jsonify(result = False,errors = [{'type': 'danger','out': "Identifiers don't match"}])

 outputs = ["","","","","","","","","","","",""]
 register = problem.getRegisters()
 lines = request.get_json().get('file').split("@")[1:]

 lnindex = 0
 for index,reg in enumerate(register):
  if reg == Problem.EXEC:
   out =  lines[lnindex]
   outputs[index] = out[out.index("\n"):].strip()
   lnindex += 1
 userId = None
 if session.has_key("account.id"):
  userId = session["account.id"]

 db.session.flush()
 solution = Solution(
  outputs[0],
  outputs[1],
  outputs[2],
  outputs[3],
  outputs[4],
  outputs[5],
  outputs[6],
  outputs[7],
  outputs[8],
  outputs[9],
  outputs[10],
  outputs[11],
  problem.id,userId)

 db.session.add(solution)
 db.session.commit()
 return jsonify(result = True,id= solution.id)

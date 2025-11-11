@addjobanddisqualifycandidate
Feature: Add job and complete Schedule job with Update flow

  Background:
    Given I launch Chrome with profile "Sundaravel"

  @addjob
  Scenario: Create a job and finish JD and scoring criteria using env values
    When I navigate to the Talent QA site
    #And I stop the script here
    And I add a new job using environment values
    And I open Job Description and write JD content
    And I open Job Score Criteria and complete selections
    
  @schedule @Addfeedbackform
  Scenario: Add Feedback Form, Create & update event for the Candidate
    When I navigate to the Talent QA site for schedule
    And Search Role to Schedule Interview
    And Click Settings
    And Click Hiring Stages
    And Open Feedback form
    And Add Feedback Form
    And Select pipeline Button
    And Update PDF
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    And Fill From Slot Time
    And Fill To Slot Time
    And Select Interview Type Offline
    And scrollToBottom
    And Select Create Event Button
    And Click confirm
    And I stop the script here for schedule
    And Schedule Interview Button
    And Select Interview Type Online
    And Click update event
    And Click disqualify
    And Select disqualify reason from config
    And I stop the script here for schedule
    And Select Change Template Button
    And I stop the script here for schedule
    And select template type
    And I stop the script here for schedule
    And Select Template Button
    And I stop the script here for schedule
    And Select Disqualify Candidate Button
    And I stop the script here for schedule
    And Click confirm disqualify
    And I stop the script here for schedule
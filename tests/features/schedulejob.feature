@schedule
Feature: Add one profile in the Jobs

  Background:
    Given I launch Chrome with schedule profile "Sundaravel"

  @Addthefeedbackform
  Scenario: Add Feedback Form 
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Click Settings
    And Click Hiring Stages
    And Click Add Hiring Stage Button
    And Click Screening Button in Add Hiring Stage
    And Click HR Screening Button in Add Hiring Stage Name
    And Click Create Stage Button
    And Open Feedback form
    And Add Feedback Form
    And I stop the script here for schedule

  @updatepdf
  Scenario: Create a new pdf 
    When Update PDF

  @deletepdf
  Scenario: Delete PDF files from workspace folder
    When Delete PDF files from workspace folder

  @updatePDFWithResume
  Scenario: Update PDF and Upload Candidate Resume
    When I navigate to the Talent QA site for schedule
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And Click Search Icon
    And Search and open candidate by generated name


     @OnlineInterviewSchedule
  Scenario: Create Online Interview.
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And I stop the script here for schedule
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    #And Fill From Slot Time
    #And Fill To Slot Time
    And Select Interview Type Online
    And scrollToBottom
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page
    And Select Create Event Button
    And Click confirm
    And I stop the script here for schedule
    And Click Back Button
    And I stop the script here for schedule
    And Click Search Icon    
    And Search candidate by generated name
    And Click Interviews Side Menu Button
    And Search candidate in interviews by generated name
    And Verify generated name in interviews
    And I stop the script here for schedule

       @OfflineInterviewSchedule
  Scenario: Create Online Interview.
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And I stop the script here for schedule
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    #And Fill From Slot Time
    #And Fill To Slot Time
    And Select Interview Type Offline
    And scrollToBottom
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page    
    And Select Create Event Button
    And Click confirm
    And Click Back Button
    And I stop the script here for schedule
    And Click Search Icon    
    And Search candidate by generated name
    And Click Interviews Side Menu Button
    And Search candidate in interviews by generated name
    And Verify generated name in interviews
    And I stop the script here for schedule


     @updateInterviewSchedule
  Scenario: Create Offline Interview & convert to Online
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And I stop the script here for schedule
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    #And Fill From Slot Time
    #And Fill To Slot Time
    And Select Interview Type Offline
    And scrollToBottom
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page    
    And Select Create Event Button
    And Click confirm
    And I stop the script here for schedule
    And Schedule Interview Button
    And Select Interview Type Online
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page    
    And Click update event
    And Click Back Button
    And I stop the script here for schedule
    And Click Search Icon
    And Search candidate by generated name
    And Click Interviews Side Menu Button
    And Search candidate in interviews by generated name
    And Verify generated name in interviews
    And I stop the script here for schedule


     @noshow
  Scenario: Create Offline Interview & convert to Online and set candidate as no show
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And I stop the script here for schedule
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    #And Fill From Slot Time
    #And Fill To Slot Time
    And Select Interview Type Offline
    And scrollToBottom
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page    
    And Select Create Event Button
    And Click confirm
    And I stop the script here for schedule
    And Schedule Interview Button
    And Select Interview Type Online
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page    
    And Click update event
    And Click Back Button
    And I stop the script here for schedule
    And Click Search Icon
    And Search candidate by generated name
    And I stop the script here for schedule
    And Click Interviews Side Menu Button
    And Search candidate in interviews by generated name
    And Verify generated name in interviews
    And Click Jobs
    And Search Role to Schedule Interview
    And Click Search Icon
    And Search and open candidate by generated name
    And Select Feedback Reason Button
    And Click No Show button
    And I stop the script here for schedule


     @cancelevent
  Scenario: Create Online Interview and cancel the created event.
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And I stop the script here for schedule
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    #And Fill From Slot Time
    #And Fill To Slot Time
    And Select Interview Type Online
    And scrollToBottom
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page
    And Select Create Event Button
    And Click confirm
    And Click Back Button
    And I stop the script here for schedule
    And Click Search Icon    
    And Search candidate by generated name
    And Click Interviews Side Menu Button
    And Search candidate in interviews by generated name
    And Verify generated name in interviews
    And Click Jobs
    And Search Role to Schedule Interview
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Click cancel event
    And Click confirm
    And Click Back Button
    And Click Search Icon
    And Search candidate by generated name
    And I stop the script here for schedule


     @disqualifySchedule
  Scenario: Create Offline Interview & Disqualify the Candidate
    When I navigate to the Talent QA site for schedule
    And Click Jobs
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And I stop the script here for schedule
    And Click Search Icon
    And Search and open candidate by generated name
    And Schedule Interview Button
    And Search and select panel member
    And Click anywhere in UI
    And Select and fill Current date
    #And Fill From Slot Time
    #And Fill To Slot Time
    And Select Interview Type Offline
    And scrollToBottom
    And Click Next Page Button in Interview Details
    And Click Next Page Button in Description Page    
    And Select Create Event Button
    And Click confirm
    And I stop the script here for schedule
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
    And Click Back Button
    And I stop the script here for schedule
    And Select Disqualify in Kanban Board
    And Click Search Icon
    And Search candidate by generated name
    And Verify candidate name in Disqualified section
    And Search and open candidate by generated name
    And Select Feedback Reason Button
    And Verify and print disqualification reason
    And I stop the script here for schedule
    
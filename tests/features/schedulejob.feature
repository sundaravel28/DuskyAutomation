@schedule
Feature: Add one profile in the Jobs

  Background:
    Given I launch Chrome with schedule profile "Sundaravel"

  @Addthefeedbackform
  Scenario: Add Feedback Form 
    When I navigate to the Talent QA site for schedule
    And Search Role to Schedule Interview
    And Click Settings
    And Click Hiring Stages
    And Open Feedback form
    And Add Feedback Form
    And I stop the script here for schedule

  @updatepdf
  Scenario: Create a new pdf 
    When Update PDF

  @updatePDFWithResume
  Scenario: Update PDF and Upload Candidate Resume
    When I navigate to the Talent QA site for schedule
    And Update PDF
    And Search Role to Schedule Interview
    And Add Candidate
    And click resume upload link
    And select source
    And click Browse File
    And Search and open candidate by generated name


     @OnlineInterviewSchedule
  Scenario: Create Online Interview.
    When I navigate to the Talent QA site for schedule
    And Update PDF
    And Search Role to Schedule Interview
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
    And Select Interview Type Online
    And scrollToBottom
    And Select Create Event Button
    And Click confirm
    And I stop the script here for schedule

       @OfflineInterviewSchedule
  Scenario: Create Online Interview.
    When I navigate to the Talent QA site for schedule
    And Update PDF
    And Search Role to Schedule Interview
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


     @updateInterviewSchedule
  Scenario: Create Offline Interview & convert to Online
    When I navigate to the Talent QA site for schedule
    And Update PDF
    And Search Role to Schedule Interview
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
    And I stop the script here for schedule


     @disqualifySchedule
  Scenario: Create Offline Interview & convert to Online
    When I navigate to the Talent QA site for schedule
    And Update PDF
    And Search Role to Schedule Interview
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
    
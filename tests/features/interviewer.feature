@Interviewflow
Feature: Interviewer validation

  Background:
    Given I launch Chrome with profile "Interviewer"


  @interviewerfeedbackvalidation
  Scenario: Interviewfeedbackvalidation
    When I navigate to the Talent Interviewer site
    And I stop the script here for interviewer login
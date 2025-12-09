@Interviewflow
Feature: Interviewer validation

  Background:
    Given I launch Chrome with profile "Interviewer"


  @interviewerfeedbackvalidation
  Scenario: Interviewfeedbackvalidation
    When I navigate to the Talent Interviewer site
    And I click View Candidates Button
    And I stop the script here for Interviewer login
    And I validate feedback count
    And I stop the script here for Interviewer login


  @pastinterviewerfeedbackvalidation
  Scenario: Interviewfeedbackvalidation
    When I navigate to the Talent Interviewer site
    And I click Past Interviews Button
    And I validate past interviews count
    And I stop the script here for Interviewer login
    

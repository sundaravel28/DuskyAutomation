@addnewjob
Feature: Add job and complete job description and scoring criteria

  Background:
    Given I launch Chrome with profiles "Sundaravel"

  Scenario: Create a job and finish JD and scoring criteria using env values
    When I navigate to the Talent QA site
    #And I stop the script here
    And I add a new job using environment values
    And I open Job Description and write JD content
    And I open Job Score Criteria and complete selections
    And I stop the script here for schedule
    Then the job creation flow should complete successfully



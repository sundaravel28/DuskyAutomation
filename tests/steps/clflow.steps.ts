import { setDefaultTimeout, Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, BrowserContext, Page, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SCHEDULE_INTERVIEW_PAGE } from '../pages/Selectors';
import { CommonUtils } from '../pages/CommonUtils';
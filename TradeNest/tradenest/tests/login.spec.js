import {test, expect} from '@playwright/test';
import {LoginPage} from './pages/loginPage';
import {Paths, ErrorMessages} from './fixtures/testData';


test.describe('Login Tests', ()=>{
    let loginPage;

    test.beforeEach(async ({page}) =>{
        loginPage = new LoginPage(page);

        await loginPage.goto(process.env.BASE_URL);
    })

    test('Should Enter Valid Credentials and Login Successfully', async ({page})=>{
        await loginPage.Login(process.env.TEST_USER_ValidEMAIL, process.env.TEST_USER_ValidPASS);
        
        await expect(page).toHaveURL(Paths.Dashboard_URL);

    })

    test('Should Enter Invalid Credentials And Display Error Messages', async ({page}) =>{
        
        await loginPage.Login(process.env.TEST_USER_InvalidEMAIL, process.env.TEST_USER_InvalidPASS);
        await expect(page.getByText(ErrorMessages.InvalidCredentials)).toBeVisible();
    })
});
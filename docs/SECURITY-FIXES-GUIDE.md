# SECURITY FIXES GUIDE

This document outlines the procedures for:

1. **Rotating Vercel Tokens**  
    Regularly rotate your Vercel tokens to ensure your application's security. Here’s how to do it:
   - Log in to your Vercel dashboard.
   - Navigate to **Settings** > **Tokens**.
   - Click on **Add Token** to create a new token.
   - Replace the old token in your application settings or environment variables with the new one.
   - Delete the old token from the Vercel dashboard.

2. **Removing .env from Git History**  
    If you have accidentally committed your `.env` file, it is essential to remove it from the Git history to prevent leaking sensitive information. Follow these steps:
   - Use the command below to remove it from your repository's history:
     ```bash
     git rm --cached .env
     git commit -m "Remove .env from git history"
     ```
   - Then, use this command to rewrite the Git history:
     ```bash
     git filter-branch --force --index-filter 
     'git rm --cached --ignore-unmatch .env' 
     --prune-empty --tag-name-filter cat -- --all
     ```
   - Finally, force push the changes to the remote repository:  
     ```bash
     git push origin --force --all
     ```

3. **Implementing Security Fixes**  
    Keeping your application secure is an ongoing process. Here are some best practices:
   - Regularly update dependencies to fix known vulnerabilities.
   - Employ static code analysis tools to catch security issues during development.
   - Conduct periodic security audits of your codebase.
   - Monitor application logs for unusual activity.
   - Educate your team about secure coding practices and keep them informed about the latest security threats.


By following this guide, you will be able to enhance the security posture of your application significantly.  

---
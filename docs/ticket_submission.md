# Ticket Submission

There are cases where you may be trying to write a rule and you find that operators or processes are not yet available to allow you to write your rule. In other cases, you may find that the rule can be written but it is not working as expected or the CORE engine is returning a strange error in the results. The following are steps to help you through the process of creating a new CORE engine ticket.

1. Before submitting a ticket, double check the [FAQ](./faq.md) to ensure that your question has not already been answered.
1. Identify the JIRA issue that is tracking your Rule
   1. Navigate to https://jira.cdisc.org/projects/CORERULES/issue
   1. Click the `View all issues and filters` link
   1. Filter for your issue using the `summary` field, which contains the conformance rule id.
   1. Once you've identified the JIRA issue, make note of the the JIRA issue url and id. The id will appear at the top of the issue and is of the format: `CORERULES-#####`
1. Create a Github issue
   1. The issue submission in the repository for the CORE engine code is located here: https://github.com/cdisc-org/cdisc-rules-engine/issues/new/choose
      - Note that if you do not have a Github account, you will need to follow the prompts to create one
   1. Select between a `Rule-Blocking Bug` or `Rule-Blocking Enhancement` and click `Get started` (green button)
   1. Follow the instructions in the issue template to fill out the github issue
      - Use the JIRA id (`CORERULES-#####`) and url that you noted in the previous steps to create the title and issue content.
      - Note that you can switch to the `Preview` tab to view a preview of your issue.
   1. After creating the github issue, make note of the new issue url
1. Create a reference to the Github issue
   1. Return to the original jira ticket
   1. Set the ticket's workflow status to `Blocked`
   1. Edit the ticket and set the `Azure Work Item URL` field to the Github url noted in the previous steps.
   1. Create a new comment with a brief description explaining the bug or missing feature and state that a github issue has been created

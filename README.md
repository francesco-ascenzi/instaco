# Instaco v2
A tool to compare Instagram followers/followings and track them over time with Node and MongoDB

### Summary
- [Requirements](#requirements)
- [Outputs](#outputs)
- [Collection structure](#collection-structure)
- [Funding](#funding)
- [Author](#author)
- [License](#license)

## Requirements
To use this tool, you must have:
- **Node.js** version 18.0.0 or higher.
- A running **MongoDB** instance (port configuration can be set in settings.json).
- Your **Instagram followers and followings JSON files**, located in the directory specified in settings.json.
- A **CLI** to execute node index.js and initiate the process.

## Outputs
Instaco generates:
- Data about your followers and users who no longer follow you, stored over time in MongoDB.
- A ```list_[yyyymmdd].txt``` file in your specified settings directory, containing users who are not currently following you.

## Collection structure
This application creates a database named "Instagram" with a collection called "followers". The structure of the "followers" collection includes:  
**- user:** string - The user's name  
**- followIt:** boolean - True if you follow the user  
**- followsMe:** boolean - True if the user follows you, false if they have unfollowed you  
**- updated:** date - The last time the process was initiated  
**- timestamp:** date - Timestamps from the followers/followings lists  

## Funding
If you liked this tool, consider funding it at [@PayPal](https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A) (the link is within package.json too)

## Author
Frash | Francesco Ascenzi ([@fra.ascenzi](https://www.instagram.com/fra.ascenzi) on IG)

# License
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

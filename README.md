# Instaco 1.0
Compare followers/followings and track them over time with Node and MongoDB

### Summary
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Outputs](#outputs)
- [Collection structure](#collection-structure)
- [Author](#author)
- [License](#license)

## Introduction
Instaco originated as a swift comparator for followers and followings on Instagram. 
Over time, requirements have evolved, leading to the development of a comparator capable of persistently storing followers and followings, as well as generating text lists of individuals who have ceased following.

## Requirements
To utilize this tool, ensure the following installations:
- Node.js
- MongoDB started on port 27018 (port configuration can be adjusted in the index.js file)
- Your followers and followings JSON files from Instagram, located inside the "data" folder at the project's root
- A command line interface for executing ```node index.js``` to initiate the process

## Outputs
It generates:
- Data regarding your followers and individuals who no longer follow you, stored over time in MongoDB
- A ```plain_list_[yyyymmdd].txt``` file inside the ```./data/lists``` folder, containing users who are presently not following you

## Collection structure
This application will establish a database named "Instagram," encompassing a collection named "followers."  
The primary structure of "followers" includes:
### - Name {String}
Contains the follower's name
### - Follow {Boolean}
A boolean that returns true if the follower continues to follow you, or false if they have unfollowed you
### - Timestamp {Date}
Holds the timestamp retrieved from the followers file to verify if a person has unfollowed and refollowed you
### - Defollow {Boolean}
A boolean that returns true if the follower has unfollowed you, or false if they continue to follow you
### - History {Array}
Contains the actions of followers, such as defollowing and refollowing
### - LastRetrieve {Date}
Records the last time the process was initiated

## Author
Francesco "Frash" Ascenzi (@frash.dev on IG)

# License
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
# Next.js Control Panel for ISDN 2602

Install dependencies with
`npm install`

Run in dev mode with
`npm run dev`

Firebase Realtime database structure
```
- admin
    - examState
        - activated:false
        - end_point:1
        - field:"final demo arena"
        - start_point:5
        - task_id:6
        - time_remain:120
    - trafficLights
        - 1
            - current_state:gree
            - id:1
            - time_remain:30
        - 2
        - 3
- demoMode
    - active:false
- settings
    - countdownTime:
    - maxPoints:12
    - numberOfTasks:6
- users
    - [uid]
        - examState
        - trafficLights
    - [another uid]
        - examState
        - trafficLights
```


Other notes:

- During final demo time, when the admin has set the `/demoMode/active` to true, all users can not use the control panel, but they can still read from `/admin` to get the exam status for the car.
- During testing, to avoid conflicts of users writing to the same firebase storage, data is now isolated under each user's uid `/users/[uid]/`
- A whitelist of admin's uids is stored locally, only admins can set the demoMode `/demoMode/active`
- Admins could also visit `/settings` page to set up the final demo configuration including the count down timer length, maximum number of start and end points as well as the number of tasks
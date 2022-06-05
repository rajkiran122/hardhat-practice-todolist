const { ethers, run, network } = require("hardhat")
const prompt = require("prompt-sync")({ sigint: true })

const addTask = async (signer, contract) => {
    console.log("------------------------------")
    console.log("Enter the task: ")
    const _title = prompt()

    console.log("Your task is being added...")
    const transactionResponse = await contract.connect(signer).addTask(_title)
    await transactionResponse.wait(1)

    console.log("Your task is successfully added!")
}

const toggleTask = async (signer, contract) => {
    console.log("------------------------------")
    console.log("Enter the id: ")
    const _id = prompt()

    console.log("Your task is being toggled...")
    const transactionResponse = await contract
        .connect(signer)
        .toggleTaskCompleted(parseInt(_id))
    await transactionResponse.wait(1)

    console.log("Your task is successfully toggled")
}

const editTheTask = async (signer, contract) => {
    console.log("------------------------------")
    console.log("Enter the id: ")
    const _id = prompt()
    console.log("Enter the new title: ")
    const _title = prompt()

    console.log("Your task is being updated...")
    const transactionResponse = await contract
        .connect(signer)
        .editTheTask(_id, _title)
    await transactionResponse.wait(1)

    console.log("Your task is successfully updated!")
}

const getAllYourTasks = async (signer, contract) => {
    console.log("------------------------------")
    const allTasks = await contract.connect(signer).getYourTasks()

    let tasks = allTasks.filter(
        (task) => task.user != "0x0000000000000000000000000000000000000000"
    )

    console.log("Your tasks are: \n")
    console.log(`Length: ${tasks.length}`)
    console.log(tasks)
}

const getAllTasksCount = async (signer, contract) => {
    console.log("------------------------------")
    const count = await contract.connect(signer).getTodosCount()
    console.log(`All todos count: ${count.toString()}`)
}

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.error("Already Verified!")
        } else {
            console.error(err)
        }
    }
}

const main = async () => {
    const todoListContractFactory = await ethers.getContractFactory("TodoList")

    console.log("Deploying contract...")
    const todoList = await todoListContractFactory.deploy()
    await todoList.deployed()
    console.log(`Contract deployed to address: ${todoList.address}`)

    if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for blocks confirmation...")
        await todoList.deployTransaction.wait(3)
        //await until 3 more blocks are created
        await verify(todoList.address, [])
    }

    const accounts = await ethers.getSigners()

    let choice

    do {
        console.log("\n------------------------------")
        console.log("1: Add a new task")
        console.log("2: Toggle task completed")
        console.log("3: Edit the task")
        console.log("4: Get all of your tasks")
        console.log("5: Get the tasks count")
        console.log("Q: Exit the program")
        console.log("------------------------------")
        console.log("Select an option from above 👆")
        choice = prompt()

        if (choice == "q") {
            break
        }

        let signer
        // console.log("------------------------------")
        // console.log("Select an account from 0 to 10 to send the transaction: ")
        // let accountIndex = prompt()
        // signer = accounts[parseInt(accountIndex)]
        signer = accounts[0]

        switch (choice) {
            case "1":
                await addTask(signer, todoList)
                break
            case "2":
                await toggleTask(signer, todoList)
                break
            case "3":
                await editTheTask(signer, todoList)
                break
            case "4":
                await getAllYourTasks(signer, todoList)
                break
            case "5":
                await getAllTasksCount(signer, todoList)
                break
            default:
                console.log("Enter the given choices!")
                break
        }
    } while (choice != "Q")
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })

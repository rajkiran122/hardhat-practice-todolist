const { assert } = require("chai")
const { ethers } = require("hardhat")

require("chai").use(require("chai-as-promised")).should()

describe("TodoList Contract", async () => {
    let contract, accounts
    beforeEach(async () => {
        const contractFactory = await ethers.getContractFactory("TodoList")
        contract = await contractFactory.deploy()
        accounts = await ethers.getSigners()
    })

    describe("Deployment", async () => {
        it("should have the correct owner address", async () => {
            const expectedAddress = accounts[0].address
            const actualAddress = await contract.signer.address
            assert(
                actualAddress,
                expectedAddress,
                `The signer should have address: ${expectedAddress}`
            )
        })
    })

    describe("Function: addTask, editTask and toggleTask", async () => {
        beforeEach(async () => {
            const txResponse = await contract
                .connect(accounts[1])
                .addTask("This is my first task")
            await txResponse.wait(1)
        })

        it("should NOT be able to edit and toggle the task except the owner of the task", async () => {
            await contract
                .connect(accounts[2])
                .editTheTask("0", "This is the edited first task").should.be
                .rejected
            await contract.connect(accounts[2]).toggleTaskCompleted("0").should
                .be.rejected
        })

        it("should be able to edit the task", async () => {
            const expectedTitle = "This is the edited task!"
            const txResponse = await contract
                .connect(accounts[1])
                .editTheTask("0", expectedTitle)
            await txResponse.wait(1)

            const actualTitle = await contract
                .connect(accounts[1])
                .getTheTask("0")

            assert(actualTitle, expectedTitle, "The task title is incorrect!")
        })

        it("should be able to toggle the task", async () => {
            let todo = await contract.connect(accounts[1]).getTheTask("0")
            const expectedCompleted = !todo.completed

            const txResponse = await contract
                .connect(accounts[1])
                .toggleTaskCompleted("0")
            await txResponse.wait(1)

            const toggledTodo = await contract
                .connect(accounts[1])
                .getTheTask("0")
            const actualCompleted = toggledTodo.completed

            assert(
                actualCompleted,
                expectedCompleted,
                `The completed should be: ${expectedCompleted}`
            )
        })
    })

    describe("Function: getYourTasks", async () => {
        beforeEach(async () => {
            const title1 = "First Task",
                title2 = "Second Task"

            const txResponse1 = await contract
                .connect(accounts[2])
                .addTask(title1)
            await txResponse1.wait(1)

            const txResponse2 = await contract
                .connect(accounts[2])
                .addTask(title2)
            await txResponse2.wait(1)
        })

        it("should get all of your tasks", async () => {
            const expectedCount = 2
            const allTasks = await contract.connect(accounts[2]).getYourTasks()
            const actualCount = allTasks.length

            assert.strictEqual(
                actualCount,
                expectedCount,
                `The count should be: ${expectedCount}`
            )
        })

        it("should get 0 number of tasks who hasn't yet added any task", async () => {
            const expectedCount = 0
            const allTasks = await contract.connect(accounts[4]).getYourTasks()
            const actualCount = allTasks.length
            assert.strictEqual(
                actualCount,
                expectedCount,
                `The count should be: ${expectedCount}`
            )
        })
    })
})

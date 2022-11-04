import { GithubUser } from "./githubUser.js"

class Favorites {
   constructor(root) {
      this.root = document.querySelector(root)
      this.load()
   }

   load() {
      // JSON.parse turns string into object
      this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || []
   }

   save() {
      // JSON.stringify turns object into a string
      localStorage.setItem('@github-favorites', JSON.stringify(this.entries))
   }

   async add(username) {
      try {
         const userExists = this.entries.find(entry => entry.login === username)
         console.log(userExists)

         if(userExists) {
            throw new Error("User already registered")
         }

         const user = await GithubUser.search(username)

         if(user.login === undefined) {
            throw new Error("User not found!")
         }

         this.entries = [user, ...this.entries]

         this.update()
         this.save()

      } catch(error) {
         alert(error.message)
      }
   }

   delete(user) {
      const filteredEntries = this.entries
         .filter(entry => entry.login !== user.login)
      this.entries = filteredEntries
      this.update()
      this.save()

      if(this.entries.length == 0) {
         this.root.querySelector(".noFavorites").classList.remove("sr-only")
      }
   }
}

export class FavoritesView extends Favorites {
   constructor(root) {
      super(root)

      this.tbody = this.root.querySelector("table tbody")

      this.update()
      this.onadd()
   }

   onadd() {
      const addButton = this.root.querySelector(".search button")
      addButton.onclick = () => {
         const { value } = this.root.querySelector(".search input")
         
         this.add(value)
      }
   }

   update() {
      this.removeAlltr()
      this.root.querySelector(".search input").value = ""

      this.entries.forEach(user => {
         const row = this.createRow()

         row.querySelector(".user img").src = 
            `https://github.com/${user.login}.png`
         row.querySelector(".user img").alt = 
            `${user.name} image`
         row.querySelector(".user a").href = 
            `https://github.com/${user.login}`
         row.querySelector(".user a p").textContent = 
            user.name
         row.querySelector(".user a span").textContent = 
            user.login
         row.querySelector(".repositories").textContent = 
            user.public_repos
         row.querySelector(".followers").textContent = 
            user.followers
         row.querySelector(".remove").onclick = () => {
            const isOk = confirm("Are you sure you want delete this user?")
            if(isOk) this.delete(user)
         }
         
         this.tbody.append(row)
         })   
   }

   createRow() {
      this.tbody.querySelector(".noFavorites").classList.add("sr-only")

      const tr = document.createElement("tr")
      tr.classList.add("tr-user")

      tr.innerHTML = `
         <td class="user">
            <img src="https://github.com/alexsmarra.png" alt="Alexandre Simões Marra image">

            <a href="https://github.com/alexsmarra" target="_blank">
               <p>Alexandre Simões Marra</p>
               <span>alexsmarra</span>
            </a>
         </td>

         <td class="repositories">
            6
         </td>

         <td class="followers">
            11
         </td>

         <td>
            <button class="remove">&times;</button>
         </td>
      `

      return tr
   }

   removeAlltr() {
      this.tbody.querySelectorAll(".tr-user")
         .forEach(tr => tr.remove())
   }
}
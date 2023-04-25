const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
const helper = require('../utils/list_helper')

  
beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
  },100000)

  
test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
},100000)

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
  
  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
  
    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
      'Go To Statement Considered Harmful'
    )
  })

  test('the id is id and not _id', async () => {
    const response = await api.get('/api/blogs')
  
    const id = response.body[0]._id
    
    expect(id).toBeUndefined()
  })



  test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Le blog de Cheikh3",
        author: "Moi-même",
        url: "https://mon-aaaa-blog.com",
        likes: 4

    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
  
    
    const contents = response.body.map(r => r.title)
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContain(
      'Le blog de Cheikh3'
    )
  })

  test('if the likes property is missing from the request, it will default to the value 0', async () => {
    const newBlog = {
        title: "Le blog de Cheikh4",
        author: "Moi-même",
        url: "https://mon-aaaa-blog.com",

    }
    await api
    .post('/api/blogs')
    .send(newBlog)

  const response = await api.get('/api/blogs')

  console.log(response.body[2])
  const likes = response.body[2].likes

  expect(likes).toBe(0)
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
    console.log(blogsAtStart)
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
  
      const blogsAtEnd = await helper.blogsInDb()
      console.log(blogsAtEnd)
      expect(blogsAtEnd).toHaveLength(
        helper.blogsInDb().length - 1
      )
  
      const contents = blogsAtEnd.map(r => r.title)
  
      expect(contents).not.toContain(blogToDelete.contents)
    },100000)
  })

  describe('Update of a blog', () => {
    test('updating a the number of likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const newLikes = {
        likes: 4

    }
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newLikes)
        .expect(200)
  
    },100000)
  })



afterAll(async () => {
  await mongoose.connection.close()
})
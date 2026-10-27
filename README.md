# LRU Cache Visualizer and Performance Analyzer

A browser-based **Design and Analysis of Algorithms (DAA)** project that visualizes the Least Recently Used (LRU) cache replacement algorithm and compares its performance with Least Frequently Used (LFU).

## Overview

Caching improves performance by storing frequently or recently accessed data for faster retrieval. When a cache reaches its maximum capacity, a replacement policy determines which entry should be removed.

This project demonstrates how the LRU algorithm works using a **HashMap and Doubly Linked List**. It provides an interactive interface to perform cache operations, visualize changes in recency order, and analyze cache hit rates across different capacities.

## Features

- **Interactive LRU Cache:** Perform GET and PUT operations.
- **Adjustable Capacity:** Set cache capacity between 1 and 12.
- **Visual Cache Representation:** View entries ordered from Most Recently Used (MRU) to Least Recently Used (LRU).
- **Step-by-Step Explanation:** Understand how each operation changes the cache.
- **Operation History:** Review previous operations and their results.
- **Statistics Dashboard:** Monitor hits, misses, evictions, and hit rate.
- **Demonstration Mode:** Run a predefined sequence of cache operations.
- **Performance Analyzer:** Compare LRU and LFU across multiple cache capacities.
- **Results Table and Bar Chart:** Compare the performance of both replacement policies.
- **Input Validation:** Handle invalid capacities, empty keys, and empty values.
- **Responsive Interface:** Use the application in a modern web browser.

## Technologies Used

- **HTML5** — Page structure
- **CSS3** — Styling and responsive layout
- **JavaScript (ES2015+)** — Cache algorithms, simulations, and interface interactions
- **JavaScript Map** — Average constant-time key lookup
- **Doubly Linked List** — Maintains the recency order
- **SVG** — Renders the performance comparison chart

## Project Structure

```text
LRU-Cache-Visualizer/
├── index.html
├── style.css
├── app.js
└── README.md
```

## How to Run

No backend, database, package installation, or build process is required.

1. Download or clone the project.
2. Keep `index.html`, `style.css`, and `app.js` in the same directory.
3. Open `index.html` in a modern web browser.
4. Start performing cache operations or use the demonstration and performance analyzer.

Alternatively, open the project folder in Visual Studio Code and use the Live Server extension to launch the application.

## How It Works

### 1. LRU Cache

The LRU cache uses two data structures:

- **HashMap:** Maps each key to its corresponding cache node.
- **Doubly Linked List:** Maintains entries in order of recent use.

The front of the list represents the most recently used entry, while the end represents the least recently used entry.

### 2. GET Operation

- If the requested key exists, the operation records a cache hit and moves the entry to the MRU position.
- If the key does not exist, the operation records a cache miss.

A GET miss does not automatically insert an entry in the interactive cache.

### 3. PUT Operation

- If the key already exists, its value is updated and the entry moves to the MRU position.
- If the key is new and the cache has available space, the entry is inserted at the MRU position.
- If the cache is full, the LRU entry is evicted before the new entry is inserted.

### 4. Performance Analysis

The analyzer processes a request sequence across selected cache capacities and compares LRU with a simplified LFU implementation.

It displays hits, misses, evictions, and hit rates in a table and bar chart.

## Algorithmic Complexity

| Operation | Average Time Complexity | Space Complexity |
|---|---|---|
| LRU GET | O(1) | — |
| LRU PUT | O(1) | — |
| LRU cache storage | — | O(C) |
| Simplified LFU eviction | O(C) | O(C) |
| Analyzer for one capacity | Depends on request count and policy | O(C) |

Where **C** is the cache capacity and **M** is the number of requests.

The LRU operations have average O(1) time complexity because the hash map locates nodes and the doubly linked list updates their positions without scanning the list. Hash-map performance can degrade in the worst case.

The simplified LFU implementation scans cached entries to find an eviction candidate, giving it O(C) eviction time.

## Demonstration

The predefined demonstration uses a cache capacity of 3 and exercises:

- Insertions
- Cache hits and misses
- Updating an existing entry
- Eviction of the least recently used entry

The expected final statistics for the demonstration are:

- **Hits:** 3
- **Misses:** 2
- **Evictions:** 2
- **Hit Rate:** 60%

The hit rate is calculated using GET operations.

## Limitations

- The application runs entirely in the browser and does not use a backend or database.
- Cache keys and values are strings.
- The analyzer accepts up to 5,000 requests.
- The LFU implementation is simplified and does not age access frequencies.
- The application does not simulate network latency or distributed caching.
- Performance results depend on the request sequence and cache capacity.

## Future Enhancements

- Add FIFO and other cache replacement policies.
- Implement an optimized LFU algorithm.
- Allow users to save and load request sequences.
- Add custom request-pattern generation.
- Support more detailed performance graphs.
- Add cache simulation for multiple levels.
- Introduce automated testing and additional performance benchmarks.

## Learning Outcomes

This project demonstrates:

- Practical implementation of the LRU replacement algorithm.
- Application of hash maps and doubly linked lists.
- Analysis of time and space complexity.
- Visualization of data structure operations.
- Comparison of cache replacement strategies.
- Evaluation of algorithm performance using experimental data.

## Author

**Sudrita Deb**

Department of Computer Science and Engineering  
KIT – Kalaignarkarunanidhi Institute of Technology  
Coimbatore, Tamil Nadu, India

**Academic Year:** 2026–2027

## License

This project was developed for academic purposes as part of the Design and Analysis of Algorithms course.
